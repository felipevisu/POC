package main.java.bitonic;

import java.util.ArrayDeque;
import java.util.Deque;

public class GFG {
    public static int[] bitonicArray(int n, int l, int r){
        if (n > (r - l) * 2 - 1){
            return new int[]{-1};
        }

        Deque<Integer> dq = new ArrayDeque<>();
        dq.addLast(r - 1);

        for (int i = r; i >= l && dq.size() < n; i--){
            dq.addLast(i);
        }

        for (int i = r - 2; i >= l && dq.size() < n; i--){
            dq.addFirst(i);
        }

        int[] res = new int[dq.size()];
        int idx = 0;

        for (int num : dq){
            res[idx++] = num;
        }

        return res;
    }
}
