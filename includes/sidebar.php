<?php
$activePage = $activePage ?? '';
function sidebarItem($href, $iconSvg, $label, $activePage, $extraAfter = '') {
    $isActive = ($activePage === $label);
    $activeClass = $isActive ? ' sidebar__item--active' : '';
    return '
        <a href="'.$href.'" class="sidebar__item'.$activeClass.'">
            '.$iconSvg.'
            <span>'.$label.'</span>
            '.$extraAfter.'
        </a>';
}
?>
<aside class="sidebar sidebar--collapsed" id="sidebar">
    <nav class="sidebar__nav">
        <?php
        echo sidebarItem('index.php',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
            'Explore', $activePage);
        echo sidebarItem('trending.php',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
            'Trending', $activePage);
        echo sidebarItem('#',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            'Community', $activePage);
        echo sidebarItem('lives.php',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
            'Live', $activePage,
            '<span class="live-badge">3</span>');
        ?>
    </nav>

    <div class="sidebar__divider"></div>

    <div class="sidebar__channels">
        <p class="sidebar__channels-title">Channels You Follow</p>
        <a href="#" class="sidebar__channel">
            <span class="sidebar__channel-avatar" style="background:linear-gradient(135deg,#6c3ce0,#3c9ce0);">N</span>
            <span>Nebula Studio</span>
        </a>
        <a href="#" class="sidebar__channel">
            <span class="sidebar__channel-avatar" style="background:linear-gradient(135deg,#e03c8a,#e0813c);">G</span>
            <span>Galaxy Music</span>
        </a>
        <a href="#" class="sidebar__channel">
            <span class="sidebar__channel-avatar" style="background:linear-gradient(135deg,#3ce0a4,#3ce0c5);">Q</span>
            <span>Quantum Tech</span>
        </a>
        <a href="#" class="sidebar__channel">
            <span class="sidebar__channel-avatar" style="background:linear-gradient(135deg,#e0c83c,#e06e3c);">S</span>
            <span>Solar Films</span>
        </a>
        <a href="#" class="sidebar__channel hidden-channel" style="display:none;">
            <span class="sidebar__channel-avatar" style="background:linear-gradient(135deg,#e03c6c,#3ce0a4);">R</span>
            <span>Rocket Science</span>
        </a>
        <a href="#" class="sidebar__channel hidden-channel" style="display:none;">
            <span class="sidebar__channel-avatar" style="background:linear-gradient(135deg,#c83ce0,#e03c8a);">M</span>
            <span>Mars Colony</span>
        </a>
        <button class="btn btn--text sidebar__show-more" id="showMoreChannels">Show more</button>
    </div>

    <div class="sidebar__divider"></div>
    <div class="sidebar__support">
        <p class="sidebar__channels-title">Support Us</p>
        <div class="support-iframe-container">
            <iframe src="https://reymit.ir/overlay/?key=NjkzM2JiMDI2Y2UwNDk4OXRPTmovSkNSbDNmcFNJQmU2R1MzelpQQkNaUkdRMEdPK0FCWEd1c3NNQVZ2R294V0drOWxSdGJrc2RZclROeW8%3D" 
                    title="Support ORBIT" 
                    sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
                    loading="lazy"
                    style="border:none; width:100%; height:250px; border-radius:12px;">
            </iframe>
        </div>
    </div>

    <button class="sidebar-toggle" id="sidebarToggle" title="Toggle Sidebar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
</aside>