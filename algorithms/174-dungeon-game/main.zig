const std = @import("std");

pub fn calculateMinimumHP(dungeon: []const []const i32) i32 {
    const rows = dungeon.len;
    const cols = dungeon[0].len;

    var dp: [100][100]i32 = undefined;

    for (&dp) |*row| {
        for (row) |*cell| {
            cell.* = std.math.maxInt(i32);
        }
    }

    dp[rows][cols - 1] = 1;
    dp[rows - 1][cols] = 1;

    var i: usize = rows;
    while (i > 0) : (i -= 1) {
        var j: usize = cols;
        while (j > 0) : (j -= 1) {
            const min_health_on_exit = @min(dp[i][j - 1], dp[i - 1][j]);
            dp[i - 1][j - 1] = @max(1, min_health_on_exit - dungeon[i - 1][j - 1]);
        }
    }

    return dp[0][0];
}

test "calculateMinimumHP works for sample dungeon" {
    const dungeon = [_][]const i32{
        &[_]i32{-2, -3, 3},
        &[_]i32{-5, -10, 1},
        &[_]i32{10, 30, -5},
    };
    const result = calculateMinimumHP(&dungeon);
    try std.testing.expect(result == 7);
}