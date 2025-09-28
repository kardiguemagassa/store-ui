interface PageTitleProps {
  title: string;
}

export default function PageTitle({title}: PageTitleProps) {
  return <h1 className="page-title">{title}</h1>;
  
}
