package com.example.executors;

import java.util.concurrent.*;

public final class Demo2 {
    static void run() throws InterruptedException, ExecutionException {
        Util.header("Demo 2: Future, results that arrive later");

        try (ExecutorService pool = Executors.newSingleThreadExecutor()){
            Future<Integer> future = pool.submit(() -> {
                Util.log("computing the expensive answer...");
                Util.sleep(500);
                return 9 * 9;
            });

            Util.log("submit() returned immediately; future.isDone()=" + future.isDone());

            while(!future.isDone()) {
                Util.log("not ready yet, doing other work on the main thread...");
                Util.sleep(100);
            }

            Integer answer = future.get();
            Util.log("future.get() = " + answer);

            Future<String> slow = pool.submit(() -> { Util.sleep(1000); return "done"; });
            try {
                slow.get(200, TimeUnit.MILLISECONDS);
            } catch (TimeoutException e) {
                Util.log("get(200ms) timed out as expected; cancelling the task");
                slow.cancel(true);
            }
        }
    }

    public static void main(String[] args) throws Exception {
        run();
    }
}
