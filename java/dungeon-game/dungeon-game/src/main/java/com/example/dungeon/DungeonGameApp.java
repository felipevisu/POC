package com.example.dungeon;


public class DungeonGameApp {

    public static void main(String[] args) {
        DungeonGame dungeon = new DungeonGame();

        int[][] board = {
                {-2, -3, 3},
                {-5, -10, 1},
                {10, 30, -5}
        };

        int minHealth = dungeon.calculateMinimumHP(board);
        System.out.println("Minimum initial health needed: " + minHealth);
    }
}