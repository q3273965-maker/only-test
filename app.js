// ============ DEMO DATA (saved to Chrome localStorage) ============

const DEMO_DATA = {
  currentUser: {
    id: 'user_0',
    name: 'Alex Johnson',
    age: 26,
    bio: 'Adventure seeker & coffee lover ☕ | Love exploring new places and trying exotic cuisines. Looking for someone who enjoys long walks, deep conversations, and spontaneous road trips! 🌍',
    location: 'New York, NY',
    work: 'Software Engineer at Google',
    education: 'Stanford University',
    height: '5\'11" (180 cm)',
    photos: ['assets/profile1.png'],
    interests: ['Travel ✈️', 'Photography 📸', 'Cooking 🍳', 'Hiking 🏔️', 'Music 🎵', 'Coffee ☕', 'Movies 🎬', 'Yoga 🧘'],
    stats: { likes: 128, matches: 24, views: '1.2k' }
  },
  profiles: [
    {
      id: 'p1', name: 'Sophia', age: 24,
      bio: 'Art lover & sunset chaser 🌅 Living life one adventure at a time.',
      location: 'Brooklyn, NY · 3 km away',
      photo: 'assets/profile1.png',
      tags: ['Art 🎨', 'Travel', 'Wine 🍷']
    },
    {
      id: 'p2', name: 'James', age: 28,
      bio: 'Fitness enthusiast & dog dad 🐕 Looking for my gym partner and life partner.',
      location: 'Manhattan, NY · 5 km away',
      photo: 'assets/profile2.png',
      tags: ['Fitness 💪', 'Dogs 🐶', 'Cooking']
    },
    {
      id: 'p3', name: 'Emma', age: 23,
      bio: 'Bookworm turned world traveler 📚✈️ Tell me your favorite book!',
      location: 'Queens, NY · 8 km away',
      photo: 'assets/profile3.png',
      tags: ['Books 📖', 'Travel ✈️', 'Coffee ☕']
    },
    {
      id: 'p4', name: 'Michael', age: 27,
      bio: 'Music producer by day, chef by night 🎵🍳 Let me cook you dinner.',
      location: 'Hoboken, NJ · 12 km away',
      photo: 'assets/profile4.png',
      tags: ['Music 🎵', 'Food 🍕', 'Guitar 🎸']
    },
    {
      id: 'p5', name: 'Olivia', age: 25,
      bio: 'Dancing through life 💃 Love salsa, hiking, and trying new restaurants.',
      location: 'Jersey City, NJ · 10 km away',
      photo: 'assets/profile1.png',
      tags: ['Dance 💃', 'Hiking 🏔️', 'Foodie']
    },
    {
      id: 'p6', name: 'Daniel', age: 29,
      bio: 'Photographer capturing moments 📷 Looking for someone to be in the frame.',
      location: 'Bronx, NY · 15 km away',
      photo: 'assets/profile2.png',
      tags: ['Photography 📸', 'Travel', 'Art']
    }
  ],
  matches: [
    { id: 'p3', name: 'Emma', photo: 'assets/profile3.png', isNew: true },
    { id: 'p1', name: 'Sophia', photo: 'assets/profile1.png', isNew: true },
    { id: 'p4', name: 'Michael', photo: 'assets/profile4.png', isNew: true },
    {
      id: 'p2', name: 'James', photo: 'assets/profile2.png', isNew: false,
      lastMessage: 'Hey! Wanna grab coffee this weekend? ☕', time: '2m ago', unread: 2, online: true
    },
    {
      id: 'p5', name: 'Olivia', photo: 'assets/profile1.png', isNew: false,
      lastMessage: 'That hiking trail was amazing! 🏔️', time: '1h ago', unread: 0, online: false
    },
    {
      id: 'p6', name: 'Daniel', photo: 'assets/profile2.png', isNew: false,
      lastMessage: 'I\'d love to show you my gallery!', time: '3h ago', unread: 1, online: true
    }
  ],
  chatMessages: {
    'p3': [
      { from: 'them', text: 'Hey there! I loved your profile 😊', time: '10:30 AM' },
      { from: 'me', text: 'Thanks! Your travel photos are incredible! Where was that beach shot taken?', time: '10:32 AM' },
      { from: 'them', text: 'That was in Bali! Have you ever been? 🌴', time: '10:33 AM' },
      { from: 'me', text: 'Not yet, but it\'s on my bucket list! What\'s your favorite book btw?', time: '10:35 AM' },
      { from: 'them', text: 'Oh I love "The Alchemist"! What about you?', time: '10:36 AM' },
      { from: 'me', text: 'Great taste! I\'m a big fan of "Sapiens" 📚', time: '10:38 AM' },
      { from: 'them', text: 'Love that one too! We should definitely get coffee and chat about books sometime ☕', time: '10:40 AM' }
    ]
  }
};

// ============ STATE MANAGEMENT ============

let appState = {
  currentScreen: 'screen-onboarding',
  currentCardIndex: 0,
  authMode: 'login',
  currentChatUser: null,
  isDragging: false,
  startX: 0, startY: 0, currentX: 0, currentY: 0
};

// ============ INIT ============

function initApp() {
  loadDataFromStorage();
  renderSwipeCards();
  renderMatches();
  renderProfile();
  setupSwipeGestures();
  renderChatMessages('p3');

  // set default chat user
  appState.currentChatUser = DEMO_DATA.matches.find(m => m.id === 'p3');

  // set nav avatar
  const navAvatar = document.getElementById('nav-avatar');
  if (navAvatar) navAvatar.style.backgroundImage = `url(${DEMO_DATA.currentUser.photos[0]})`;
}

function loadDataFromStorage() {
  try {
    const saved = localStorage.getItem('flameheart_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.chatMessages) DEMO_DATA.chatMessages = parsed.chatMessages;
      if (parsed.currentUser) Object.assign(DEMO_DATA.currentUser, parsed.currentUser);
      if (parsed.matches) DEMO_DATA.matches = parsed.matches;
    }
  } catch (e) { console.log('No saved data found, using defaults'); }
}

function saveDataToStorage() {
  try {
    localStorage.setItem('flameheart_data', JSON.stringify({
      chatMessages: DEMO_DATA.chatMessages,
      currentUser: DEMO_DATA.currentUser,
      matches: DEMO_DATA.matches
    }));
  } catch (e) { console.error('Failed to save data:', e); }
}

// ============ NAVIGATION ============

// Navigation history stack
let navHistory = [];

function navigateTo(screenId, mode, fromPopState) {
  const prevScreen = document.querySelector('.screen.active');
  const nextScreen = document.getElementById(screenId);

  if (!nextScreen || prevScreen === nextScreen) return;

  // Push to browser history (unless triggered by popstate/back button)
  if (!fromPopState) {
    if (prevScreen) {
      navHistory.push(prevScreen.id);
    }
    history.pushState({ screen: screenId }, '', '#' + screenId);
  }

  if (prevScreen) {
    prevScreen.style.opacity = '0';
    prevScreen.style.transform = 'translateX(-30px)';
    setTimeout(() => {
      prevScreen.classList.remove('active');
      prevScreen.style.opacity = '';
      prevScreen.style.transform = '';
    }, 300);
  }

  setTimeout(() => {
    nextScreen.style.opacity = '';
    nextScreen.style.transform = '';
    nextScreen.classList.add('active');
    appState.currentScreen = screenId;

    // Update ALL nav highlights across every bottom-nav on every screen
    const navMap = {
      'screen-home': 0,
      'screen-matches': 1,
      'screen-chat': 2,
      'screen-profile': 3
    };
    const activeIdx = navMap[screenId];
    if (activeIdx !== undefined) {
      document.querySelectorAll('.bottom-nav').forEach(nav => {
        const items = nav.querySelectorAll('.nav-item');
        items.forEach((item, i) => {
          item.classList.toggle('active', i === activeIdx);
        });
      });
    }
  }, prevScreen ? 200 : 0);

  if (mode === 'login') switchAuthTab('login');
}

// Handle browser back button
window.addEventListener('popstate', (e) => {
  if (navHistory.length > 0) {
    const prevScreenId = navHistory.pop();
    navigateTo(prevScreenId, null, true);
  } else {
    // If no history, go to onboarding
    navigateTo('screen-onboarding', null, true);
  }
});

// ============ AUTH ============

function switchAuthTab(mode) {
  appState.authMode = mode;
  const loginTab = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  const nameField = document.getElementById('signup-name-field');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const btnText = document.getElementById('auth-btn-text');

  if (mode === 'signup') {
    loginTab.classList.remove('active');
    signupTab.classList.add('active');
    nameField.classList.remove('hidden');
    title.textContent = 'Create Account';
    subtitle.textContent = 'Find your perfect match today';
    btnText.textContent = 'Sign Up';
  } else {
    signupTab.classList.remove('active');
    loginTab.classList.add('active');
    nameField.classList.add('hidden');
    title.textContent = 'Welcome Back';
    subtitle.textContent = 'Sign in to continue your journey';
    btnText.textContent = 'Log In';
  }
}

function handleAuth(e) {
  e.preventDefault();
  const loader = document.getElementById('auth-loader');
  const btnText = document.getElementById('auth-btn-text');
  const btn = document.getElementById('auth-submit-btn');

  btnText.classList.add('hidden');
  loader.classList.remove('hidden');
  btn.disabled = true;

  setTimeout(() => {
    btnText.classList.remove('hidden');
    loader.classList.add('hidden');
    btn.disabled = false;
    showToast('success', `${appState.authMode === 'login' ? 'Logged in' : 'Account created'} successfully! 🎉`);
    navigateTo('screen-home');
    saveDataToStorage();
  }, 1500);
}

function socialLogin(provider) {
  showToast('info', `Connecting to ${provider}...`);
  setTimeout(() => {
    showToast('success', `Signed in with ${provider}! 🎉`);
    navigateTo('screen-home');
  }, 1000);
}

function togglePassword() {
  const input = document.getElementById('auth-password');
  const icon = document.querySelector('.toggle-password i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

function handleLogout() {
  showToast('info', 'Logged out successfully');
  navigateTo('screen-onboarding');
}

// ============ SWIPE CARDS ============

function renderSwipeCards() {
  const container = document.getElementById('swipe-cards');
  const noMore = document.getElementById('no-more-cards');
  container.innerHTML = '';

  const profiles = DEMO_DATA.profiles;
  if (appState.currentCardIndex >= profiles.length) {
    noMore.classList.remove('hidden');
    return;
  }
  noMore.classList.add('hidden');

  // Render up to 3 stacked cards
  const end = Math.min(appState.currentCardIndex + 3, profiles.length);
  for (let i = end - 1; i >= appState.currentCardIndex; i--) {
    const p = profiles[i];
    const depth = i - appState.currentCardIndex;
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.id = `card-${p.id}`;
    card.style.zIndex = 10 - depth;
    card.style.transform = `scale(${1 - depth * 0.04}) translateY(${depth * 10}px)`;
    card.style.opacity = depth > 1 ? 0.5 : 1;

    card.innerHTML = `
      <div class="swipe-card-img" style="background-image: url('${p.photo}')"></div>
      <div class="swipe-label swipe-label-like">LIKE</div>
      <div class="swipe-label swipe-label-nope">NOPE</div>
      <div class="swipe-label swipe-label-super">SUPER</div>
      <div class="swipe-card-info">
        <h2>${p.name} <span>${p.age}</span></h2>
        <p class="card-location"><i class="fas fa-map-marker-alt"></i> ${p.location}</p>
        <p class="swipe-card-bio">${p.bio}</p>
        <div class="card-tags">${p.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}</div>
      </div>
    `;
    container.appendChild(card);
  }
}

function setupSwipeGestures() {
  const container = document.getElementById('swipe-cards');

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);
}

function getTopCard() {
  const cards = document.querySelectorAll('.swipe-card');
  if (cards.length === 0) return null;
  let topCard = cards[0];
  let maxZ = parseInt(topCard.style.zIndex || 0);
  cards.forEach(c => {
    const z = parseInt(c.style.zIndex || 0);
    if (z > maxZ) { maxZ = z; topCard = c; }
  });
  return topCard;
}

function onPointerDown(e) {
  const card = getTopCard();
  if (!card) return;
  appState.isDragging = true;
  appState.startX = e.clientX;
  appState.startY = e.clientY;
  appState.currentX = 0;
  appState.currentY = 0;
  card.style.transition = 'none';
  card.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  if (!appState.isDragging) return;
  const card = getTopCard();
  if (!card) return;

  appState.currentX = e.clientX - appState.startX;
  appState.currentY = e.clientY - appState.startY;

  const rotate = appState.currentX * 0.1;
  card.style.transform = `translate(${appState.currentX}px, ${appState.currentY}px) rotate(${rotate}deg)`;

  // Show labels
  const likeLabel = card.querySelector('.swipe-label-like');
  const nopeLabel = card.querySelector('.swipe-label-nope');
  const superLabel = card.querySelector('.swipe-label-super');

  const absX = Math.abs(appState.currentX);
  const absY = Math.abs(appState.currentY);

  if (appState.currentX > 30) {
    likeLabel.style.opacity = Math.min((appState.currentX - 30) / 80, 1);
    nopeLabel.style.opacity = 0;
    superLabel.style.opacity = 0;
  } else if (appState.currentX < -30) {
    nopeLabel.style.opacity = Math.min((-appState.currentX - 30) / 80, 1);
    likeLabel.style.opacity = 0;
    superLabel.style.opacity = 0;
  } else if (appState.currentY < -50) {
    superLabel.style.opacity = Math.min((-appState.currentY - 50) / 80, 1);
    likeLabel.style.opacity = 0;
    nopeLabel.style.opacity = 0;
  } else {
    likeLabel.style.opacity = 0;
    nopeLabel.style.opacity = 0;
    superLabel.style.opacity = 0;
  }
}

function onPointerUp(e) {
  if (!appState.isDragging) return;
  appState.isDragging = false;

  const card = getTopCard();
  if (!card) return;

  const threshold = 100;
  card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';

  if (appState.currentX > threshold) {
    animateSwipe(card, 'right');
  } else if (appState.currentX < -threshold) {
    animateSwipe(card, 'left');
  } else if (appState.currentY < -threshold) {
    animateSwipe(card, 'up');
  } else {
    // Reset
    card.style.transform = 'scale(1)';
    card.querySelectorAll('.swipe-label').forEach(l => l.style.opacity = 0);
  }
}

function swipeAction(dir) {
  const card = getTopCard();
  if (!card) return;

  // Button press animation
  const btnMap = { left: 'btn-dislike', right: 'btn-like', up: 'btn-superlike' };
  const btn = document.getElementById(btnMap[dir]);
  if (btn) {
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => btn.style.transform = '', 200);
  }

  card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
  animateSwipe(card, dir);
}

function animateSwipe(card, direction) {
  const profile = DEMO_DATA.profiles[appState.currentCardIndex];

  if (direction === 'right') {
    card.style.animation = 'swipeRight 0.5s ease forwards';
    if (Math.random() > 0.5) setTimeout(() => showMatchOverlay(profile), 600);
    else showToast('success', `You liked ${profile.name}! ❤️`);
  } else if (direction === 'left') {
    card.style.animation = 'swipeLeft 0.5s ease forwards';
    showToast('info', `Passed on ${profile.name}`);
  } else {
    card.style.animation = 'swipeUp 0.5s ease forwards';
    showToast('info', `Super liked ${profile.name}! ⭐`);
    setTimeout(() => showMatchOverlay(profile), 600);
  }

  setTimeout(() => {
    appState.currentCardIndex++;
    renderSwipeCards();
    saveDataToStorage();
  }, 500);
}

function resetCards() {
  appState.currentCardIndex = 0;
  renderSwipeCards();
}

// ============ MATCH OVERLAY ============

function showMatchOverlay(profile) {
  const overlay = document.getElementById('match-overlay');
  document.getElementById('match-name').textContent = profile.name;
  document.getElementById('match-avatar-you').style.backgroundImage = `url(${DEMO_DATA.currentUser.photos[0]})`;
  document.getElementById('match-avatar-them').style.backgroundImage = `url(${profile.photo})`;
  overlay.classList.remove('hidden');
}

function closeMatchOverlay() {
  document.getElementById('match-overlay').classList.add('hidden');
}

function openChatFromMatch() {
  closeMatchOverlay();
  navigateTo('screen-chat');
}

// ============ MATCHES ============

function renderMatches() {
  const newList = document.getElementById('new-matches-list');
  const msgList = document.getElementById('messages-list');

  const newMatches = DEMO_DATA.matches.filter(m => m.isNew);
  const msgMatches = DEMO_DATA.matches.filter(m => !m.isNew);

  document.getElementById('new-match-count').textContent = newMatches.length;

  newList.innerHTML = newMatches.map(m => `
    <div class="new-match-item" onclick="openChat('${m.id}')">
      <div class="new-match-avatar" style="background-image: url('${m.photo}')"></div>
      <span>${m.name}</span>
    </div>
  `).join('');

  msgList.innerHTML = msgMatches.map(m => `
    <div class="message-item" onclick="openChat('${m.id}')">
      <div class="message-avatar" style="background-image: url('${m.photo}')">
        ${m.online ? '<div class="online-indicator"></div>' : ''}
      </div>
      <div class="message-info">
        <h4>${m.name}</h4>
        <p class="message-preview">${m.lastMessage || ''}</p>
      </div>
      <div class="message-meta">
        <span class="message-time">${m.time || ''}</span>
        ${m.unread > 0 ? `<div class="unread-badge">${m.unread}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function openChat(userId) {
  const match = DEMO_DATA.matches.find(m => m.id === userId);
  if (!match) return;

  appState.currentChatUser = match;
  document.getElementById('chat-user-name').textContent = match.name;
  document.getElementById('chat-avatar').style.backgroundImage = `url(${match.photo})`;

  if (!DEMO_DATA.chatMessages[userId]) {
    DEMO_DATA.chatMessages[userId] = [
      { from: 'them', text: `Hey! Great to match with you! 😊`, time: 'Just now' }
    ];
    saveDataToStorage();
  }

  renderChatMessages(userId);
  navigateTo('screen-chat');
}

// ============ CHAT ============

function renderChatMessages(userId) {
  const container = document.getElementById('chat-messages');
  const messages = DEMO_DATA.chatMessages[userId] || [];

  container.innerHTML = '<div class="chat-date">Today</div>';
  container.innerHTML += messages.map(m => `
    <div class="message-bubble ${m.from === 'me' ? 'message-sent' : 'message-received'}">
      ${m.text}
      <div class="message-time-stamp">${m.time}</div>
    </div>
  `).join('');

  // Scroll to bottom
  setTimeout(() => container.scrollTop = container.scrollHeight, 100);
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || !appState.currentChatUser) return;

  const userId = appState.currentChatUser.id;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!DEMO_DATA.chatMessages[userId]) DEMO_DATA.chatMessages[userId] = [];
  DEMO_DATA.chatMessages[userId].push({ from: 'me', text, time: timeStr });

  input.value = '';
  renderChatMessages(userId);
  saveDataToStorage();

  // Simulate typing + reply
  const container = document.getElementById('chat-messages');
  setTimeout(() => {
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.id = 'typing-ind';
    typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  }, 800);

  setTimeout(() => {
    const t = document.getElementById('typing-ind');
    if (t) t.remove();

    const replies = [
      'That sounds amazing! 😍', 'Haha, I love that! 😂',
      'Tell me more! 😊', 'We should definitely do that!',
      'You\'re so sweet! 💕', 'I was just thinking the same thing!',
      'That\'s so cool! ✨', 'Can\'t wait! 🎉',
      'You have great taste! 👌', 'Let\'s plan something! 🗓️'
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    const rTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    DEMO_DATA.chatMessages[userId].push({ from: 'them', text: reply, time: rTime });
    renderChatMessages(userId);
    saveDataToStorage();
  }, 2500);
}

// ============ PROFILE ============

function renderProfile() {
  const user = DEMO_DATA.currentUser;

  document.getElementById('profile-avatar').style.backgroundImage = `url(${user.photos[0]})`;
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-age-loc').textContent = `${user.age} · ${user.location}`;
  document.getElementById('profile-bio').textContent = user.bio;
  document.getElementById('stat-likes').textContent = user.stats.likes;
  document.getElementById('stat-matches').textContent = user.stats.matches;
  document.getElementById('stat-views').textContent = user.stats.views;
  document.getElementById('detail-location').textContent = user.location;
  document.getElementById('detail-work').textContent = user.work;
  document.getElementById('detail-education').textContent = user.education;
  document.getElementById('detail-height').textContent = user.height;

  // Photo gallery
  const gallery = document.getElementById('photo-gallery');
  gallery.innerHTML = user.photos.map(p => `
    <div class="gallery-photo" style="background-image: url('${p}')"></div>
  `).join('') + '<div class="gallery-add"><i class="fas fa-plus"></i></div>';

  // Interests
  const interestsList = document.getElementById('interests-list');
  interestsList.innerHTML = user.interests.map(i => `<span class="interest-tag">${i}</span>`).join('');
}

function toggleEditField(field) {
  if (field === 'bio') {
    const bioText = document.getElementById('profile-bio');
    const bioEdit = document.getElementById('bio-edit');
    if (bioEdit.classList.contains('hidden')) {
      bioEdit.classList.remove('hidden');
      bioEdit.value = bioText.textContent;
      bioText.classList.add('hidden');
      bioEdit.focus();
      bioEdit.addEventListener('blur', () => {
        DEMO_DATA.currentUser.bio = bioEdit.value;
        bioText.textContent = bioEdit.value;
        bioEdit.classList.add('hidden');
        bioText.classList.remove('hidden');
        saveDataToStorage();
        showToast('success', 'Bio updated! ✨');
      }, { once: true });
    }
  }
}

function toggleEditProfile() {
  showToast('info', 'Settings panel coming soon! ⚙️');
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    DEMO_DATA.currentUser.photos[0] = e.target.result;
    renderProfile();
    document.getElementById('nav-avatar').style.backgroundImage = `url(${e.target.result})`;
    saveDataToStorage();
    showToast('success', 'Profile photo updated! 📸');
  };
  reader.readAsDataURL(file);
}

// ============ FILTER ============

function toggleFilterPanel() {
  const panel = document.getElementById('filter-panel');
  panel.classList.toggle('hidden');
}

// ============ TOAST ============

function showToast(type, message) {
  const container = document.getElementById('toast-container');
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============ INIT ON LOAD ============
document.addEventListener('DOMContentLoaded', initApp);
