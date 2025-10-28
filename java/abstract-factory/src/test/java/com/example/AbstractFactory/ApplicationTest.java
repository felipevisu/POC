package com.example.AbstractFactory;

import com.example.AbstractFactory.UI.Application;
import com.example.AbstractFactory.UI.GUIFactory;
import com.example.AbstractFactory.UI.MacFactory;
import com.example.AbstractFactory.UI.WindowsFactory;
import junit.framework.TestCase;

public class ApplicationTest extends TestCase {

    public void testDrawWindowsUI() {
        GUIFactory windowsFactory = new WindowsFactory();
        Application app = new Application(windowsFactory);
        String result = app.drawUI();
        assertEquals("Windows Button | Check Windows Checkbox", result);
    }

    public void testDrawMacUI() {
        GUIFactory macFactory = new MacFactory();
        Application app = new Application(macFactory);
        String result = app.drawUI();
        assertEquals("Mac Button | Check Mac Checkbox", result);
    }
}
