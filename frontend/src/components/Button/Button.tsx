type Props = {
  type: "button" | "submit" | "reset",
  value: string,
  className?: string,
  onClick: () => void,
}

const Button = ({ type, value, className, onClick }: Props) => {

  return (
    <>
    <button type={type} className={className} onClick={onClick}>{value}</button>
    </>
  )
};

export default Button;