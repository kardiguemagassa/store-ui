
interface PriceProps {
  currency: string;
  price: number;
}

export default function Price({ currency, price }: PriceProps) {
  return (
    <>
    <span>{price.toFixed(2)}</span>
      {currency}
    </>
  );

}
