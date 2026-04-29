// Per-person image focal points — keyed by headshot filename
// Values are CSS object-position strings tuned to each photo
const HEADSHOT_FOCAL_POINTS = {
  'Sarah.jpg':    '50% 30%',  // face centered, slightly upper half
  'Luke.jpg':     '50% 25%',  // seated café shot, face upper half
  'Lisa.jpeg':    '50% 25%',  // face upper-center, voluminous hair
  'Lakshmee.jpeg':'50% 35%',  // square-ish crop, face center
  'Beth.jpg':     '50% 20%',  // tall portrait, face in upper third
  'DJ.jpg':       '50% 20%',  // tall portrait, face in upper third
  'Miranda.JPG':  '50% 20%',  // tall portrait, face upper third
  'Sofiya.jpg':   '50% 30%',  // close headshot, face center
};

// Fetch and render steering committee members
fetch('SteeringBios.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('members-container');
    if (!container) return;

    data.forEach((member, index) => {
      const card = document.createElement('article');
      card.className = 'member-card';

      // ARIA labeling
      const nameId = `member-name-${index}`;
      card.setAttribute('aria-labelledby', nameId);

      // Image or initials placeholder
      if (member.headshot) {
        const img = document.createElement('img');
        img.src = member.headshot;
        img.alt = member.altText || `Headshot of ${member.name}`;
        img.loading = 'lazy';
        // Apply per-person focal point so each face is centered in the card frame
        const filename = member.headshot.split('/').pop();
        const focalPoint = HEADSHOT_FOCAL_POINTS[filename] || '50% 20%';
        img.style.objectPosition = focalPoint;
        card.appendChild(img);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'no-photo';
        placeholder.setAttribute('aria-hidden', 'true');
        const initials = member.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        const span = document.createElement('span');
        span.className = 'no-photo-initials';
        span.textContent = initials;
        placeholder.appendChild(span);
        card.appendChild(placeholder);
      }

      // Content container
      const content = document.createElement('div');
      content.className = 'card-content';

      // Name
      const nameEl = document.createElement('h3');
      nameEl.id = nameId;
      nameEl.textContent = member.name;
      content.appendChild(nameEl);

      // Pronouns
      if (member.pronouns) {
        const pronounsEl = document.createElement('p');
        pronounsEl.className = 'pronouns';
        pronounsEl.textContent = member.pronouns;
        content.appendChild(pronounsEl);
      }

      // Title
      if (member.title && member.title !== member.name) {
        const titleEl = document.createElement('p');
        titleEl.className = 'title';
        titleEl.textContent = member.title;
        content.appendChild(titleEl);
      }

      // Bio
      if (member.fullBio) {
        const bioContainer = document.createElement('div');
        bioContainer.className = 'bio-container';

        const bioText = document.createElement('p');
        bioText.className = 'bio-text';
        bioText.textContent = member.fullBio;
        bioText.id = `bio-${index}`;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-btn';
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-controls', bioText.id);
        toggleBtn.textContent = 'Read More';

        toggleBtn.addEventListener('click', () => {
          const isOpen = bioText.classList.contains('expanded');

          // Close all other bios
          document.querySelectorAll('.bio-text').forEach(b => b.classList.remove('expanded'));
          document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.textContent = 'Read More';
            btn.setAttribute('aria-expanded', 'false');
          });

          // Toggle this one
          if (!isOpen) {
            bioText.classList.add('expanded');
            toggleBtn.textContent = 'Read Less';
            toggleBtn.setAttribute('aria-expanded', 'true');
          }
        });

        bioContainer.appendChild(bioText);
        bioContainer.appendChild(toggleBtn);
        content.appendChild(bioContainer);
      }

      // Links
      if (member.links && member.links.length) {
        const linksDiv = document.createElement('div');
        linksDiv.className = 'links';

        member.links.forEach(link => {
          // Skip malformed links (social handles without URLs)
          const url = link.url && link.url.startsWith('http') ? link.url : null;
          if (!url) return;

          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = link.type;
          // Accessible label includes the person's name for context
          a.setAttribute('aria-label', `${link.type} — ${member.name} (opens in new tab)`);
          linksDiv.appendChild(a);
        });

        if (linksDiv.children.length > 0) {
          content.appendChild(linksDiv);
        }
      }

      card.appendChild(content);
      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error('Error loading steering committee:', err);
    const container = document.getElementById('members-container');
    if (container) {
      const msg = document.createElement('p');
      msg.textContent = 'Committee information could not be loaded. Please try again later.';
      container.appendChild(msg);
    }
  });
