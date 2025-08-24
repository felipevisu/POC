package com.example.dungeon;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DungeonGameTest {
    @Test
    void testExampleCase() {
        DungeonGame dungeon = new DungeonGame();
        int[][] board = {
                {-2, -3, 3},
                {-5, -10, 1},
                {10, 30, -5}
        };
        assertEquals(7, dungeon.calculateMinimumHP(board));
    }

    @Test
    void testSingleCellPositive() {
        DungeonGame dungeon = new DungeonGame();
        int[][] board = {{5}};
        assertEquals(1, dungeon.calculateMinimumHP(board));
    }

    @Test
    void testSingleCellNegative() {
        DungeonGame dungeon = new DungeonGame();
        int[][] board = {{-5}};
        assertEquals(6, dungeon.calculateMinimumHP(board)); // need enough to survive
    }

    @Test
    void testAllZeros() {
        DungeonGame dungeon = new DungeonGame();
        int[][] board = {
                {0, 0},
                {0, 0}
        };
        assertEquals(1, dungeon.calculateMinimumHP(board));
    }

    @Test
    void testPathWithHealing() {
        DungeonGame dungeon = new DungeonGame();
        int[][] board = {
                {0, -3, 5},
                {-2, 4, -1},
                {1, -1, -2}
        };
        assertEquals(3, dungeon.calculateMinimumHP(board));
    }
}