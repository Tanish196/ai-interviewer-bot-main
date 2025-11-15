import './Shared.css';

const Loader = ({ message = 'Loading…', subtext = '', fullScreen = true }) => {
    const inner = (
        <div className="loader-container" role="status" aria-live="polite" aria-busy="true">
            <div className="loader-visual" aria-hidden="true">
                <div className="spinner" />
            </div>
            <div className="loader-message">{message}</div>
            {subtext ? <div className="loader-subtext">{subtext}</div> : null}
        </div>
    );

    if (fullScreen) {
        return <div className="loader-overlay">{inner}</div>;
    }

    return inner;
};

export default Loader;
