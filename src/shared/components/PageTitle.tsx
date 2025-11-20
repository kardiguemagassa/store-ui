interface PageTitleProps {
  title: string;
  className?: string;
}

export default function PageTitle({ title, className = "" }: PageTitleProps) {
  return (
    <h1 className={`text-3xl font-bold text-center  text-primary  dark:text-light mb-6font-primary${className}`.trim()}>{title}</h1>
  );
}
