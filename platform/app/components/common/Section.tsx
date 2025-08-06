interface Props {
    id: string,
}

export default function Section({ id, children }: React.PropsWithChildren<Props>) {
    return (
        <section id={id} className="snap-end w-full">
            {children}
        </section>
    )
}
