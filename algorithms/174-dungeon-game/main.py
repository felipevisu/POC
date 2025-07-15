def calculateMinimumHP(dungeon):
    rows, cols = len(dungeon), len(dungeon[0])

    # create a DP table initialized with infinity
    dp = [[float('inf')] * (cols+1) for _ in range(rows + 1)]

    # Set base cases for the cell after bottom-right (princess cell)
    dp[rows][cols - 1] = dp[rows - 1][cols] = 1

    for i in reversed(range(rows)):
        for j in reversed(range(cols)):
            min_health_on_exit = min(dp[i + 1][j], dp[i][j + 1])
            dp[i][j] = max(1, min_health_on_exit - dungeon[i][j])

    return dp[0][0]

dungeon = [
  [-2, -3, 3],
  [-5, -10, 1],
  [10, 30, -5]
]

print(calculateMinimumHP(dungeon))