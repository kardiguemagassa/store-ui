import type { ReactNode } from 'react';
import PageTitle from './PageTitle'

interface PageHeadingProps {
  title: string;
  children: ReactNode;
}

export default function PageHeading({ title, children }: PageHeadingProps) {
  return (
    <div className="text-center max-w-[576px] mx-auto px-4 py-6">
      <PageTitle title={title} />
      <p className="font-primary leading-6 text-gray-600 dark:text-lighter">
        {children}
      </p>
    </div>
  );
}
