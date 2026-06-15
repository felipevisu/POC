package com.example.executors;


import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class Demo1 {
    static void run (){
        Util.header("Demo 1: submit + thread reuse");

        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            for (int i = 1; i <= 5; i++){
                final int taskId = i;
                pool.submit(() -> {
                    Util.log("starting task " + taskId);
                    Util.sleep(150);
                    Util.log("finished task " + taskId);
                });
            }
            Util.log("all 5 tasks submitted (this prints before they finish!)");
        }
        System.out.println("  pool closed; every task completed before we got here.");
    }

    public static void main(String[] args) {
        run();
    }
}
