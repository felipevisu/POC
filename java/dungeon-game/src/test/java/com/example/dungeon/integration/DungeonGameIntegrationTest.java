package com.example.dungeon.integration;

import com.example.dungeon.entity.Board;
import com.example.dungeon.entity.Player;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class DungeonGameIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCompleteGameWorkflow() throws Exception {
        // Step 1: Create a player
        Player player = new Player("Alice", "alice@example.com");
        String playerJson = objectMapper.writeValueAsString(player);

        String playerResponse = mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Alice")))
                .andReturn().getResponse().getContentAsString();

        Player createdPlayer = objectMapper.readValue(playerResponse, Player.class);

        // Step 2: Create a board
        BoardRequest boardRequest = new BoardRequest();
        boardRequest.setName("Test Dungeon");
        boardRequest.setBoard(new int[][]{{-2, -3, 3}, {-5, -10, 1}, {10, 30, -5}});

        String boardJson = objectMapper.writeValueAsString(boardRequest);

        String boardResponse = mockMvc.perform(post("/api/boards")
                .contentType(MediaType.APPLICATION_JSON)
                .content(boardJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Test Dungeon")))
                .andReturn().getResponse().getContentAsString();

        Board createdBoard = objectMapper.readValue(boardResponse, Board.class);

        // Step 3: Play a game
        PlayGameRequest gameRequest = new PlayGameRequest();
        gameRequest.setPlayerId(createdPlayer.getId());
        gameRequest.setBoardId(createdBoard.getId());

        String gameJson = objectMapper.writeValueAsString(gameRequest);

        mockMvc.perform(post("/api/games/play")
                .contentType(MediaType.APPLICATION_JSON)
                .content(gameJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.playerName", is("Alice")))
                .andExpect(jsonPath("$.boardName", is("Test Dungeon")))
                .andExpect(jsonPath("$.minimumHealth", is(7)));
    }

    // Helper classes for request bodies
    public static class BoardRequest {
        private String name;
        private int[][] board;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int[][] getBoard() { return board; }
        public void setBoard(int[][] board) { this.board = board; }
    }

    public static class PlayGameRequest {
        private Long playerId;
        private Long boardId;

        public Long getPlayerId() { return playerId; }
        public void setPlayerId(Long playerId) { this.playerId = playerId; }
        public Long getBoardId() { return boardId; }
        public void setBoardId(Long boardId) { this.boardId = boardId; }
    }
}
