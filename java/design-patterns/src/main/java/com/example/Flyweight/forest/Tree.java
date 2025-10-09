package com.example.Flyweight.forest;


import java.awt.*;

public class Tree {
    private int x;
    private int y;

    public Tree(int x, int y, TreeType type) {
        this.x = x;
        this.y = y;
    }

    public void draw(Graphics graphics) {
        System.out.println("Drawing tree at (" + x + ", " + y + ")");
    }
}
