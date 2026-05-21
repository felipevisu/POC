package main

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

type User struct {
	Id int `json:"id"`
	Name string `json:"name"`
	Email string `json:"email"`
}

func fetchUserFromDB(id int) (User, error) {
	fmt.Printf(" [db] slow fetch for user %d\n", id)
	time.Sleep(2 * time.Second)
	return User {
		Id: id,
		Name: "Felipe Faria",
		Email: "felipevisu@gmail.com",
	}, nil
}

func getUser(rdb *redis.Client, id int) (User, error) {
	key := fmt.Sprintf("user:%d", id)

	cached, err := rdb.Get(ctx, key).Result()

	if err != redis.Nil {
		return User{}, err
	}

	if err == nil {
		fmt.Printf(" [cache] HIT for %s\n", key)
		var u User
		data := []byte(cached)
		err := json.Unmarshal(data, &u)

		if err != nil {
			return User{}, err
		}
		
		return u, nil
	}

	fmt.Printf(" [cache] MISS for %s\n", key)
	u, err := fetchUserFromDB(id)
	if err != nil {
		return User{}, err
	}

	encoded, err := json.Marshal(u)
	if err != nil {
		return User{}, err
	}

	ttl := 60 * time.Second
	err = rdb.Set(ctx, key, encoded, ttl).Err()

	if err != nil {
		return User{}, err
	}

	return u, nil
}

func main() {
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})
	defer rdb.Close()

	err := rdb.Ping(ctx).Err()
	if err != nil {
		fmt.Println("Cannot reach Redis. Is the container running?", err)
		return 
	}

	for i := 1; i <= 3; i++ {
		fmt.Printf("Request %d:\n", i)
		start := time.Now()
		u, err := getUser(rdb, 42)
		if err != nil {
			fmt.Println("error:", err)
			return
		}
		fmt.Printf("  -> got %s in %v\n\n", u.Name, time.Since(start).Round(time.Millisecond))
	}
}