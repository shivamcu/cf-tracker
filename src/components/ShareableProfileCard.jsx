import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import styles from '../styles/ShareableProfileCard.module.css';

export default function ShareableProfileCard({ handle }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    axios.get(`/api/cf/user/${handle}`)
      .then(res => setStats(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [handle]);

  const downloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      const link = document.createElement('a');
      link.download = `${handle}-cf-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to download image. Please try again.');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/${handle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className={styles.message}>Loading your card...</div>;
  if (error || !stats || !stats.userInfo) return <div className={styles.message}>Could not load card data.</div>;

  const { userInfo, ratingCount, tagCount, totalSolved } = stats;

  const getRankColor = (rank) => {
    const r = rank?.toLowerCase() || '';
    if (r.includes('grandmaster')) return '#FF0000';
    if (r === 'master') return '#FF8C00';
    if (r === 'candidate master') return '#AA00AA';
    if (r === 'expert') return '#0000FF';
    if (r === 'specialist') return '#03A89E';
    if (r === 'pupil') return '#008000';
    return '#808080';
  };

  const rankColor = getRankColor(userInfo.rank);

  let easy = 0, medium = 0, hard = 0;
  if (ratingCount) {
    Object.entries(ratingCount).forEach(([rating, count]) => {
      const r = parseInt(rating);
      if (r <= 1400) easy += count;
      else if (r <= 2000) medium += count;
      else hard += count;
    });
  }
  
  const totalRated = easy + medium + hard;
  const easyPct = totalRated ? (easy / totalRated) * 100 : 0;
  const medPct = totalRated ? (medium / totalRated) * 100 : 0;
  const hardPct = totalRated ? (hard / totalRated) * 100 : 0;

  const topTags = tagCount ? Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 3) : [];
  const memberYear = userInfo.memberSince || 'Unknown';
  const contribution = userInfo.contribution || 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.gradientBorder} ref={cardRef}>
        <div className={styles.cardInner}>
          <div className={styles.header}>
            {avatarError || !userInfo.avatar ? (
              <div className={styles.avatarFallback}>
                {handle.substring(0, 2).toUpperCase()}
              </div>
            ) : (
              <img 
                src={`/api/cf/avatar?url=${encodeURIComponent(userInfo.avatar)}`} 
                alt={handle} 
                crossOrigin="anonymous" 
                className={styles.avatar}
                onError={() => setAvatarError(true)} 
              />
            )}
            <div className={styles.headerInfo}>
              <h3 className={styles.handle}>{handle}</h3>
              <span className={styles.rank} style={{ color: rankColor }}>{userInfo.rank?.toUpperCase() || 'UNRATED'}</span>
              <span className={styles.memberSince}>Member since {memberYear}</span>
            </div>
          </div>
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statValue} style={{ color: rankColor }}>{userInfo.rating || 'N/A'}</span>
              <span className={styles.statLabel}>Current Rating</span>
              <span className={styles.statSub}>Max: {userInfo.maxRating || 'N/A'}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{totalSolved}</span>
              <span className={styles.statLabel}>Problems Solved</span>
              <span className={styles.statSub}>Contrib: {contribution > 0 ? `+${contribution}` : contribution}</span>
            </div>
          </div>
          <div className={styles.breakdownSection}>
            <div className={styles.sectionTitle}>Difficulty Breakdown</div>
            <div className={styles.progressBar}>
              {easy > 0 && <div className={styles.progressEasy} style={{ width: `${easyPct}%` }}></div>}
              {medium > 0 && <div className={styles.progressMed} style={{ width: `${medPct}%` }}></div>}
              {hard > 0 && <div className={styles.progressHard} style={{ width: `${hardPct}%` }}></div>}
            </div>
            <div className={styles.breakdownLabels}>
              <span className={styles.labelEasy}>Easy ({easy})</span>
              <span className={styles.labelMed}>Medium ({medium})</span>
              <span className={styles.labelHard}>Hard ({hard})</span>
            </div>
          </div>
          {topTags.length > 0 && (
            <div className={styles.topicsSection}>
              <div className={styles.sectionTitle}>Top Topics</div>
              <div className={styles.tagsContainer}>
                {topTags.map(([tag, count]) => (
                  <div key={tag} className={styles.tag}>
                    {tag} <span className={styles.tagCount}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={styles.watermark}>Tracked with CF Tracker</div>
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={downloadImage} className={`${styles.btn} ${styles.btnPrimary}`}>Download PNG</button>
        <button onClick={copyLink} className={`${styles.btn} ${styles.btnSecondary}`}>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
}