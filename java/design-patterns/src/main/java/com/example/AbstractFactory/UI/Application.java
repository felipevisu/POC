package com.example.AbstractFactory.UI;

public class Application {
    private final Button button;
    private final Checkbox checkbox;

    public Application(GUIFactory factory){
        this.button = factory.createButton();
        this.checkbox = factory.createCheckbox();
    }

    public String drawUI(){
        return button.render() + " | " + checkbox.check();
    }
}
