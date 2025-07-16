import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

public class Main {
    public static int maxArea(List<Integer> height){
        int size = height.size();

        int left = 0;
        int right = size -1;
        int area = 0;

        while(left < right){
            int newArea = (right - left) * Math.min(height.get(left), height.get(right));
            if(newArea > area){
                area = newArea;
            }
            if(height.get(left) < height.get(right)){
                left += 1;
            } else {
                right -= 1;
            }
        }

        return area;
    }

    public static void main(String[] args){
        List<Integer> list = new ArrayList<>(Arrays.asList(1,8,6,2,5,4,8,3,7));
        int result = maxArea(list);

        assert result == 49 : "Expected 49 but got " + result;
        System.out.println("✅ Test passed!");
    }
}