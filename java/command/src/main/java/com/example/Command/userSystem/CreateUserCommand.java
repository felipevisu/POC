package com.example.Command.userSystem;


public class CreateUserCommand implements Command {
    private final User user;
    private final UserRepository userRepository;
    private Long generatedId;

    public CreateUserCommand(User user, UserRepository userRepository) {
        this.userRepository = userRepository;
        this.user = user;
    }

    @Override
    public void execute() {
        this.generatedId = userRepository.save(user);
        System.out.println("User created with id: " + generatedId);
    }

    @Override
    public void undo() {
        if (generatedId != null) {
            userRepository.delete(generatedId);
            System.out.println("User with ID " + generatedId + " deleted");
        }
    }
}
