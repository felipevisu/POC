package main

import (
	"fmt"
	"log"

	"example.com/greetings"
)

func main() {
	names := []string{"Gladys", "Samantha", "Darrin"}

	messages, err := greetings.Hellos(names)
    if err != nil {
        log.Fatal(err)
    }

	fmt.Println(messages)
}