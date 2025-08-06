interface Props {
    id: string,
}

export default function Section({ id, children }: React.PropsWithChildren<Props>) {
    return (
        <section id={id} className="snap-end h-dvh w-full">
            {children}
        </section>
    )
}
