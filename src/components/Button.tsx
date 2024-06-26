export const Button = ({
  onClick,
  disabled,
  children,
}: React.PropsWithChildren<{
  onClick: () => void;
  disabled: boolean;
}>) => {
  return (
    <button
      type="button"
      className="group px-2.5 py-2 text-tremor-default disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
