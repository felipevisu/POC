import math


class Solution:
    def __init__(self):
        numbers = []

    def initialize_list(self, n):
        self.numbers = [True for i in range(0, n)]
        self.numbers[0] = self.numbers[1] = False

    def is_prime(self, n):
        for i in range(2, n):
            if n % i == 0:
                return False
        return True

    def countPrimes(self, n: int) -> int:

        if n < 2:
            return 0
        isPrime = [True] * n
        isPrime[0] = isPrime[1] = False

        for i in range(2, math.ceil(math.sqrt(n))):
            if isPrime[i]:
                for multiples_of_i in range(i * i, n, i):
                    isPrime[multiples_of_i] = False

        return sum(isPrime)


def test():
    # assert Solution().countPrimes(1) == 0
    assert Solution().countPrimes(10) == 4
    # assert Solution().countPrimes(0) == 0
    # assert Solution().countPrimes(3) == 1
