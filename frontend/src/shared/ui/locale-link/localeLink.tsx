import { Link } from '@tanstack/react-router';
import {useLocaleRoute} from "@shared/lib";

type LocaleLinkProps = {
    to: string;
    params?: Record<string, string>;
    children: React.ReactNode;
    className?: string;
};

export function LocaleLink({
                               to,
                               params,
                               children,
                               className,
                           }: LocaleLinkProps) {
    const { localeRoute } = useLocaleRoute();

    return (
        <Link
            {...localeRoute(to, params)}
            className={className}
        >
            {children}
        </Link>
    );
}