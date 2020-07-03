package main

import (
	"context"
	"log"
	"net"
	"time"

	"google.golang.org/grpc"
)

type mainService struct {
}

func (m mainService) Clock(empty *Empty, server MainService_ClockServer) error {
	for {
		timeStr := time.Now().UTC().Format(time.RFC3339)
		err := server.Send(&Time{
			Timestamp: &timeStr,
		})
		if err != nil {
			return err
		}
		time.Sleep(1 * time.Second)
	}
}

func (m mainService) Hello(ctx context.Context, empty *Empty) (*Greeting, error) {
	msg := "Hello World"
	return &Greeting{
		Message: &msg,
	}, nil
}

func main() {
	listener, err := net.Listen("tcp", ":54321")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	server := grpc.NewServer()

	service := mainService{}
	RegisterMainServiceServer(server, service)
	log.Fatal(server.Serve(listener))
}
