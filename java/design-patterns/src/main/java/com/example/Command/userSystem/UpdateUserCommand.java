package com.example.Command.userSystem;

public class UpdateUserCommand implements Command {
    private final UserRepository userRepository;
    private final Long userId;
    private final User newUserData;
    private User previousUserData;

    public UpdateUserCommand(UserRepository userRepository, Long userId, User newUserData) {
        this.userRepository = userRepository;
        this.userId = userId;
        this.newUserData = newUserData;
    }

    @Override
    public void execute() {
        this.previousUserData = userRepository.findById(userId);
        userRepository.update(userId, newUserData);
        System.out.println("User " + userId + " updated");
    }

    @Override
    public void undo() {
        if (previousUserData != null) {
            userRepository.update(userId, previousUserData);
            System.out.println("User " + userId + " reverted to previous state");
        }
    }
}
