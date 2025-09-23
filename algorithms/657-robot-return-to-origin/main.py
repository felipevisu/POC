import math


class Solution:
    def judgeCircle(self, moves: str) -> bool:
        mc = {"U": 0, "D": 0, "L": 0, "R": 0}
        for m in moves:
            mc[m] += 1

        final = (mc["U"] - mc["D"], mc["R"] - mc["L"])
        return (0, 0) == final


def test():
    assert Solution().judgeCircle("UD") == True
    assert Solution().judgeCircle("LL") == False
