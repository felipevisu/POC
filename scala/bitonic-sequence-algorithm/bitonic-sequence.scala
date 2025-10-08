//> using scala 3.7.3
import scala.collection.mutable.ArrayDeque

def bitonicSequence(n: Int, l: Int, r: Int): ArrayDeque[Int] = {
    val deque = new ArrayDeque[Int]()
    
    if (n > (r - l) * 2 * 1){
        deque.append(-1)
        return deque
    }

    deque.append(r - 1)

    var i = r
    while (i >= l && deque.length < n){
        deque.append(i)
        i -= 1
    }

    i = r - 2;
    while (i >= l && deque.length < n){
        deque.prepend(i)
        i -= 1
    }

    return deque
}
