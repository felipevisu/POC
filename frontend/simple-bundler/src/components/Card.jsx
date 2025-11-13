import { styled } from "@linaria/react";

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin: 16px 0;
`;

const CardTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #333;
`;

const CardContent = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
`;

export { Card, CardTitle, CardContent };
