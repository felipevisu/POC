package main

import (
	"fmt"
	"os"
	"path/filepath"
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


func main() {
	documents, err := loadDocuments()

	if err != nil {
		panic(err)
	}

	for i := range documents {

		fmt.Println(
			"Embedding:",
			documents[i].Filename,
		)
	}
}