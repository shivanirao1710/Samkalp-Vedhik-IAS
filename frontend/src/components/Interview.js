import React from 'react';
import '../styles/Interview.css';

const Interview = () => {
    return (
        <div className="interview-container">
            <div className="interview-header text-center">
                <div className="badge-purple">
                    <span className="icon">✨</span> AI-Powered Mock Interview
                </div>
                <h2>Practice with AI Interview Coach</h2>
                <p className="subtitle">
                    Get real-time feedback on your communication skills, body language, and content quality with our advanced AI interview system.
                </p>
            </div>

            <div className="interview-content">
                <div className="interview-left">
                    <div className="interview-banner">
                        <div className="banner-overlay">
                            <h3>Master Your Interview Skills</h3>
                            <p>Build confidence with AI-powered practice</p>
                        </div>
                    </div>

                    <div className="stats-row">
                        <div className="stat-card">
                            <div className="stat-value text-blue">12</div>
                            <div className="stat-label">Interviews<br />Completed</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value text-green">78%</div>
                            <div className="stat-label">Avg Score<br />Last Month</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value text-purple">+15%</div>
                            <div className="stat-label">Improvement<br />This Month</div>
                        </div>
                    </div>
                </div>

                <div className="interview-right">
                    <div className="guidelines-card">
                        <h3>Before You Begin</h3>

                        <div className="guideline-item">
                            <div className="guideline-icon bg-blue">💻</div>
                            <div className="guideline-text">
                                <h4>Enable Camera & Microphone</h4>
                                <p>Allow browser permissions to use your camera and microphone for the interview</p>
                            </div>
                        </div>

                        <div className="guideline-item">
                            <div className="guideline-icon bg-green">✓</div>
                            <div className="guideline-text">
                                <h4>Find a Quiet Space</h4>
                                <p>Ensure you're in a well-lit, quiet environment with minimal distractions</p>
                            </div>
                        </div>

                        <div className="guideline-item">
                            <div className="guideline-icon bg-orange">⏱</div>
                            <div className="guideline-text">
                                <h4>Estimated Duration</h4>
                                <p>The interview will take approximately 15-20 minutes to complete</p>
                            </div>
                        </div>

                        <div className="guideline-item">
                            <div className="guideline-icon bg-purple">!</div>
                            <div className="guideline-text">
                                <h4>AI Analysis</h4>
                                <p>Get instant feedback on communication, emotions, and content quality</p>
                            </div>
                        </div>

                        <div className="expectations-box">
                            <h4>What to Expect</h4>
                            <ul>
                                <li>5 questions covering your background, knowledge, and situational responses</li>
                                <li>2 minutes thinking time per question</li>
                                <li>Real-time emotion and communication tracking</li>
                                <li>Detailed report with improvement suggestions</li>
                            </ul>
                        </div>

                        <button className="start-interview-btn">Start AI Interview</button>
                        <p className="consent-text">By starting, you consent to video and audio recording for analysis</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Interview;
