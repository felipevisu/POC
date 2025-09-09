package com.example.Flyweight.forest;


import java.awt.*;

public class Tree {
    private int x;
    private int y;
    private TreeType type;

    public Tree(int x, int y, TreeType type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    public void draw(Graphics graphics) {
        System.out.println("Drawing tree at (" + x + ", " + y + ")");
    }
}
