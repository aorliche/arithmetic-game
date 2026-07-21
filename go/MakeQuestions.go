package main

import (
	"encoding/json"
	"fmt"
	"math/rand/v2"
)

type Question struct {
	Op string
	Num1 int
	Num2 int
	OpStr string
	Ans int
}

func main() {
	nAdd := 6
	nSub := 6
	nMult := 6
	nDiv := 2
	nQ := nAdd + nSub + nMult + nDiv
	qs := make([]Question, nQ)
	qCount := 0
	for i := 0; i<nAdd; i++ {
		q := &qs[qCount]
		q.Op = "add"
		q.Num1 = rand.IntN(5000)+1
		q.Num2 = rand.IntN(5000)+1
		q.OpStr = "+"
		q.Ans = q.Num1 + q.Num2
		qCount++
	}
	for i := 0; i<nSub; i++ {
		q := &qs[qCount]
		q.Op = "sub"
		q.Num1 = rand.IntN(9999)+1
		q.Num2 = rand.IntN(q.Num1)+1
		q.OpStr = "-"
		q.Ans = q.Num1 - q.Num2
		qCount++
	}
	for i := 0; i<nMult; i++ {
		q := &qs[qCount]
		q.Op = "mult"
		q.Num1 = rand.IntN(99)+1
		q.Num2 = rand.IntN(q.Num1)+1
		q.OpStr = "*"
		q.Ans = q.Num1 * q.Num2
		qCount++
	}
	for i := 0; i<nDiv; i++ {
		q := &qs[qCount]
		q.Op = "div"
		q.Ans = rand.IntN(99)+1
		q.Num2 = rand.IntN(99)+1
		q.Num1 = q.Ans*q.Num2
		q.OpStr = "/"
		q.Ans = q.Num1 / q.Num2
		qCount++
	}
	bytes, _ := json.Marshal(qs)
	fmt.Println(string(bytes))
}
