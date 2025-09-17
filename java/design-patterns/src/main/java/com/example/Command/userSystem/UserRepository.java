package com.example.Command.userSystem;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

public class UserRepository {
    private final Map<Long, User> users = new HashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public Long save(User user) {
        Long id = idGenerator.getAndIncrement();
        user.setId(id);
        users.put(id, user);
        return id;
    }

    public User findById(Long id) {
        return users.get(id);
    }

    public void update(Long id, User user) {
        if (users.containsKey(id)) {
            user.setId(id);
            users.put(id, user);
        }
    }

    public boolean delete(Long id) {
        return users.remove(id) != null;
    }

    public List<User> findAll() {
        return new ArrayList<>(users.values());
    }
}
