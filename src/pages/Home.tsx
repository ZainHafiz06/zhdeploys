export default function Home() {
    return (
        <div className="container">
            <div className="s-container">
                <video 
                    className="ambient-video"
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                >
                    <source src="/clip.mp4" type="video/mp4" />
                </video>

                <video 
                    className="main-video"
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                >
                    <source src="/clip.mp4" type="video/mp4" />
                </video>

                <h1 className="h-1">
                    code that actually ships.
                </h1>

                <h1 className="h-2">
                    <a href="https://github.com/ZainHafiz06/Portfolio">
                        https://github.com/ZainHafiz06/Portfolio
                    </a>
                </h1>                 
            </div>
        </div>
    )
}