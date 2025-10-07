package bitonic;

import main.java.bitonic.GFG;

/**
 * Hello world!
 */
public class App {
    public static void main(String[] args) {
        GFG gfg = new GFG();
        int[] res = gfg.bitonicArray(5, 3, 10);
        for (int val : res) {
            System.out.print(val + " ");
        }
        System.out.println();
    }
}
