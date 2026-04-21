import java.io.*;
import java.util.*;

class SegTree {
    static int n = 6;
    static int array[] = { 0, 1, 3, 5, -2, 3 };
    static int segtree[] = new int[4 * n];

    public static void build(int node, int l, int r){
        System.out.println(Arrays.toString(segtree));
        System.out.printf("node=%d l=%d r=%d%n", node, l, r);
        if(l == r){
            segtree[node] = array[l];
        } else {
            int mid = (l + r)/2;
            build(2 * node, l, mid);
            build(2 * node + 1, mid + 1, r);
            segtree[node] = segtree[2 * node] + segtree[2 * node + 1];
        }
    }

    public static void update(int node, int l, int r, int idx, int val){
        if(l == r){
            array[idx] += val;
            segtree[node] += val;
        } else {
            int mid = (l + r)/2;
            if(l <= idx && idx <= mid){
                update(2  * node, l, mid, idx, val);
            } else {
                update(2 * node + 1, mid + 1, r, idx, val);
            }

            segtree[node] = segtree[2 * node] + segtree[2 * node + 1];
        }
    }

    public static int query(int node, int tl, int tr, int l, int r){
        if(r < tl || tr < l){
            return 0;
        }
        if(l <= tr && tr <= r){
            return segtree[node];
        }
        int tm = (tl + tr)/2;
        return query(2 * node, tl, tm, l, r) + query(2 * node + 1, tm + 1, tr, l, r);
    }

    public static void main(String[] args){
        build(1, 0, n-1);
        update(1, 0, n - 1, 1, 100);

        System.out.println("sum of value in range 1-3 are: " + query(1, 0, n - 1, 1, 3));
    }
}