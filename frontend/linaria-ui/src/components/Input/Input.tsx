import { styled } from "@linaria/react";

const StyledInput = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return <StyledInput {...props} />;
};

export default Input;
