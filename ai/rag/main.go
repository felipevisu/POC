package main

import (
	"bufio"
	"context"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"

	"github.com/ollama/ollama/api"
)


type Document struct {
	Filename  string
	Content   string
	Embedding []float64
}

type SearchResult struct {
	Document Document
	Score    float64
}

func loadDocuments() ([]Document, error) {
	var docs []Document
	files, err := filepath.Glob("./documents/*.txt")

	if err != nil {
		return nil, err
	}

	for _, file := range files {
		content, err := os.ReadFile(file)

		if err != nil {
			return nil, err
		}

		docs = append(docs, Document{
			Filename: filepath.Base(file),
			Content:  string(content),
		})
	}

	return docs, nil
}

func generateEmbedding(client *api.Client, text string) ([]float64, error) {
	req := &api.EmbeddingRequest{
		Model:  "nomic-embed-text",
		Prompt: text,
	}

	resp, err := client.Embeddings(
		context.Background(),
		req,
	)

	if err != nil {
		return nil, err
	}
	
	return resp.Embedding, nil
}

func cosineSimilarity(a, b []float64) float64 {
	var dot float64
	var normA float64
	var normB float64

	for i := range a {
		dot += a[i] * b[i]
		normA += a[i] * a[i]
		normB += b[i] * b[i]
	}

	answer := dot / math.Sqrt(normA) * math.Sqrt(normB)

	return answer
}

func search(client *api.Client, docs []Document, query string) []SearchResult {
	queryEmbedding, err := generateEmbedding(
		client,
		query,
	)

	if err != nil {
		panic(err)
	}

	var results []SearchResult

	for _, doc := range docs {
		score := cosineSimilarity(
			queryEmbedding,
			doc.Embedding,
		)

		results = append(results,
			SearchResult{
				Document: doc,
				Score:    score,
			},
		)
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Score >
			results[j].Score
	})

	return results
}


func main() {
	client, err := api.ClientFromEnvironment()

	if err != nil {
		panic(err)
	}

	documents, err := loadDocuments()

	if err != nil {
		panic(err)
	}

	for i := range documents {

		fmt.Println(
			"Embedding:",
			documents[i].Filename,
		)

		embedding, err := generateEmbedding(client, documents[i].Content)

		if err != nil {
			panic(err)
		}

		documents[i].Embedding = embedding
	}

	for {
		fmt.Print("Question: ")		
		reader := bufio.NewReader(os.Stdin)
		query, _ := reader.ReadString('\n')

		results := search(
			client,
			documents,
			query,
		)

		for i, result := range results[:3] {
			fmt.Printf(
				"%d. %s (%.4f)\n",
				i+1,
				result.Document.Filename,
				result.Score,
			)
		}
	}
}