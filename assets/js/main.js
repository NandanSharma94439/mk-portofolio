/**
 * MK Trading Academy - Premium Portfolio Main Script
 * Architecture: Singleton Pattern, Modular Sub-systems
 * Dependencies: GSAP 3 Core, GSAP ScrollTrigger
 * Optimization: DOM Caching, requestAnimationFrame, Passive Event Listeners
 */

(function () {
    'use strict';

    // ==========================================
    // 1. CONFIGURATION & STATE
    // ==========================================
    const CONFIG = {
        ease: {
            premium: 'expo.out',
            smooth: 'power3.out',
            bounce: 'elastic.out(1, 0.5)',
            idle: 'sine.inOut'
        },
        duration: {
            fast: 0.4,
            base: 0.8,
            slow: 1.5,
            ambient: 3
        }
    };

    let state = {
        lastScrollY: window.scrollY,
        isScrollingUp: false,
        ticking: false
    };

    // ==========================================
    // 2. DOM CACHE
    // ==========================================
    const DOM = {
        header: {
            el: document.querySelector('header'),
            nav: document.querySelector('nav'),
            logo: document.querySelector('.logo h1'),
            links: document.querySelectorAll('.menu a')
        },
        hero: {
            section: document.querySelector('#home'),
            title: document.querySelector('.hero-content h1'),
            desc: document.querySelector('.hero-content p'),
            btns: document.querySelectorAll('.hero-buttons .btn'),
            image: document.querySelector('.hero-image img'),
            glows: document.querySelectorAll('.hero-glow')
        },
        about: {
            section: document.querySelector('#about'),
            glows: document.querySelectorAll('.about-glow'),
            tag: document.querySelector('.about-left .section-tag'),
            title: document.querySelector('.about-left h2'),
            desc: document.querySelectorAll('.about-left p'),
            rightContainer: document.querySelector('.about-right'),
            cards: document.querySelectorAll('.about-card')
        },
        stats: {
            section: document.querySelector('#statistics'),
            title: document.querySelector('#statistics .section-title'),
            cards: document.querySelectorAll('.stat-card'),
            numbers: document.querySelectorAll('.stat-card h3')
        },
        philosophy: {
            section: document.querySelector('#philosophy'),
            header: document.querySelector('.philosophy-header'),
            list: document.querySelector('.philosophy-list'),
            principles: document.querySelectorAll('.principle')
        },
        performance: {
            section: document.querySelector('#performance'),
            title: document.querySelector('#performance .section-title'),
            metrics: document.querySelectorAll('.metric-card'),
            dashboard: document.querySelector('.performance-dashboard'),
            equityChart: document.querySelector('.equity-chart'),
            monthlyTableRows: document.querySelectorAll('.table-row'),
            proofSection: document.querySelector('.proof-section'),
            proofCards: document.querySelectorAll('.proof-card')
        },
        contact: {
            section: document.querySelector('#contact'),
            title: document.querySelector('#contact .section-title'),
            infoCards: document.querySelectorAll('.info-card'),
            form: document.querySelector('.contact-form'),
            formGroups: document.querySelectorAll('.form-group'),
            submitBtn: document.querySelector('.contact-form button')
        }
    };

    // ==========================================
    // 3. UTILITIES
    // ==========================================
    const Utils = {
        /**
         * Safely registers GSAP plugins
         */
        registerPlugins() {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
            } else {
                console.warn('GSAP or ScrollTrigger is missing.');
            }
        },

        /**
         * Custom text splitter for cinematic reveals (Avoids third-party plugin dependency)
         */
        splitTextToWords(element) {
            if (!element) return [];
            const text = element.innerText;
            element.innerHTML = '';
            const words = text.trim().split(/\s+/);
            const wordNodes = [];

            words.forEach((word, index) => {
                const wrapper = document.createElement('span');
                wrapper.style.display = 'inline-block';
                wrapper.style.overflow = 'hidden';
                wrapper.style.verticalAlign = 'top';
                wrapper.style.marginRight = index < words.length - 1 ? '0.25em' : '0';

                const inner = document.createElement('span');
                inner.style.display = 'inline-block';
                inner.innerText = word;
                inner.style.transform = 'translateY(100%)';
                inner.classList.add('reveal-word');

                wrapper.appendChild(inner);
                element.appendChild(wrapper);
                wordNodes.push(inner);
            });

            return wordNodes;
        },

        /**
         * Premium magnetic hover effect for CTAs
         */
        initMagneticEffect(elements, strength = 30) {
            elements.forEach(el => {
                if (!el) return;
                
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = (e.clientX - rect.left - rect.width / 2) * (strength / 100);
                    const y = (e.clientY - rect.top - rect.height / 2) * (strength / 100);

                    gsap.to(el, {
                        x: x,
                        y: y,
                        duration: CONFIG.duration.fast,
                        ease: CONFIG.ease.premium
                    });
                });

                el.addEventListener('mouseleave', () => {
                    gsap.to(el, {
                        x: 0,
                        y: 0,
                        duration: CONFIG.duration.base,
                        ease: CONFIG.ease.bounce
                    });
                });
            });
        },

        /**
         * Animated number counter
         */
        animateCounter(element) {
            if (!element) return;
            const originalText = element.innerText;
            const targetNumber = parseFloat(originalText.replace(/[^0-9.]/g, ''));
            const suffix = originalText.replace(/[0-9.]/g, '');

            if (isNaN(targetNumber)) return;

            const counterObj = { val: 0 };
            
            gsap.to(counterObj, {
                val: targetNumber,
                duration: 2,
                ease: CONFIG.ease.premium,
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    once: true
                },
                onUpdate: () => {
                    const currentVal = targetNumber % 1 !== 0 
                        ? counterObj.val.toFixed(1) 
                        : Math.floor(counterObj.val);
                    element.innerText = currentVal + suffix;
                }
            });
        }
    };

    // ==========================================
    // 4. ANIMATION CONTROLLERS
    // ==========================================
    const Animations = {
        
        initNavigation() {
            // Smooth scroll for anchor links
            DOM.header.links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });

            // Smart Header show/hide on scroll
            window.addEventListener('scroll', () => {
                state.lastScrollY = window.scrollY;
                if (!state.ticking) {
                    window.requestAnimationFrame(() => {
                        const currentScroll = window.scrollY;
                        
                        if (currentScroll > 50) {
                            if (currentScroll > state.lastScrollY + 5) {
                                // Scrolling Down - Hide
                                gsap.to(DOM.header.el, { yPercent: -100, duration: CONFIG.duration.fast, ease: CONFIG.ease.smooth });
                            } else if (currentScroll < state.lastScrollY - 5) {
                                // Scrolling Up - Show with backdrop
                                gsap.to(DOM.header.el, { 
                                    yPercent: 0, 
                                    duration: CONFIG.duration.fast, 
                                    ease: CONFIG.ease.smooth,
                                    backgroundColor: 'rgba(10, 10, 10, 0.85)',
                                    backdropFilter: 'blur(12px)'
                                });
                            }
                        } else {
                            // Top of page
                            gsap.to(DOM.header.el, { 
                                yPercent: 0, 
                                duration: CONFIG.duration.fast, 
                                backgroundColor: 'transparent',
                                backdropFilter: 'blur(0px)'
                            });
                        }
                        
                        state.lastScrollY = currentScroll;
                        state.ticking = false;
                    });
                    state.ticking = true;
                }
            }, { passive: true });

            // Nav Load Animation
            gsap.fromTo([DOM.header.logo, ...DOM.header.links], 
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: CONFIG.duration.base, ease: CONFIG.ease.premium, delay: 0.2 }
            );
        },

        initHero() {
            if (!DOM.hero.section) return;

            const titleWords = Utils.splitTextToWords(DOM.hero.title);
            const tl = gsap.timeline();

            // Initial Entrance
            tl.to(titleWords, {
                y: '0%',
                duration: 1.2,
                stagger: 0.08,
                ease: CONFIG.ease.premium,
                delay: 0.4
            })
            .fromTo(DOM.hero.desc,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: CONFIG.duration.base, ease: CONFIG.ease.smooth },
                "-=0.8"
            )
            .fromTo(DOM.hero.btns,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: CONFIG.duration.base, stagger: 0.15, ease: CONFIG.ease.smooth },
                "-=0.6"
            )
            .fromTo(DOM.hero.image,
                { scale: 1.1, opacity: 0, y: 40 },
                { scale: 1, opacity: 1, y: 0, duration: CONFIG.duration.slow, ease: CONFIG.ease.premium },
                "-=1.2"
            );

            // Ambient Glow Motion
            if (DOM.hero.glows.length > 0) {
                gsap.to(DOM.hero.glows[0], {
                    y: 30, x: 20, rotation: 5,
                    duration: CONFIG.duration.ambient,
                    ease: CONFIG.ease.idle,
                    yoyo: true, repeat: -1
                });
                gsap.to(DOM.hero.glows[1], {
                    y: -30, x: -20, rotation: -5,
                    duration: CONFIG.duration.ambient * 1.2,
                    ease: CONFIG.ease.idle,
                    yoyo: true, repeat: -1
                });

                // Mouse Parallax
                DOM.hero.section.addEventListener('mousemove', (e) => {
                    const xPos = (e.clientX / window.innerWidth - 0.5) * 60;
                    const yPos = (e.clientY / window.innerHeight - 0.5) * 60;

                    gsap.to(DOM.hero.glows[0], { x: xPos, y: yPos, duration: 2, ease: 'power2.out' });
                    gsap.to(DOM.hero.glows[1], { x: -xPos, y: -yPos, duration: 2, ease: 'power2.out' });
                    gsap.to(DOM.hero.image, { x: xPos * 0.3, y: yPos * 0.3, duration: 1.5, ease: 'power2.out' });
                });
            }

            Utils.initMagneticEffect(DOM.hero.btns);
        },

        initAbout() {
            if (!DOM.about.section) return;

            // Ambient Background
            gsap.to(DOM.about.glows, {
                scale: 1.1, opacity: 0.7,
                duration: 4, ease: "sine.inOut",
                yoyo: true, repeat: -1, stagger: 2
            });

            // Left Content Reveal
            const leftElements = [DOM.about.tag, DOM.about.title, ...DOM.about.desc];
            gsap.fromTo(leftElements,
                { y: 40, opacity: 0 },
                {
                    y: 0, opacity: 1, stagger: 0.15, duration: CONFIG.duration.base, ease: CONFIG.ease.premium,
                    scrollTrigger: {
                        trigger: DOM.about.section,
                        start: 'top 75%'
                    }
                }
            );

            // Right Cards Premium Stagger
            gsap.fromTo(DOM.about.cards,
                { y: 60, opacity: 0, scale: 0.95 },
                {
                    y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: CONFIG.duration.base, ease: CONFIG.ease.premium,
                    scrollTrigger: {
                        trigger: DOM.about.rightContainer,
                        start: 'top 80%'
                    }
                }
            );
        },

        initStatistics() {
            if (!DOM.stats.section) return;

            gsap.fromTo(DOM.stats.title,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: CONFIG.duration.base, ease: CONFIG.ease.smooth, scrollTrigger: { trigger: DOM.stats.section, start: 'top 85%' }}
            );

            gsap.fromTo(DOM.stats.cards,
                { y: 40, opacity: 0 },
                {
                    y: 0, opacity: 1, stagger: 0.1, duration: CONFIG.duration.base, ease: CONFIG.ease.premium,
                    scrollTrigger: { trigger: DOM.stats.cards[0], start: 'top 85%' },
                    onStart: () => {
                        DOM.stats.numbers.forEach(Utils.animateCounter);
                    }
                }
            );
        },

        initPhilosophy() {
            if (!DOM.philosophy.section) return;

            gsap.fromTo(DOM.philosophy.header,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: CONFIG.duration.base, ease: CONFIG.ease.smooth, scrollTrigger: { trigger: DOM.philosophy.section, start: 'top 80%' }}
            );

            // Sequential line-up reveal
            gsap.fromTo(DOM.philosophy.principles,
                { x: -30, opacity: 0 },
                {
                    x: 0, opacity: 1, stagger: 0.2, duration: CONFIG.duration.base, ease: CONFIG.ease.premium,
                    scrollTrigger: {
                        trigger: DOM.philosophy.list,
                        start: 'top 75%'
                    }
                }
            );
        },

        initPerformance() {
            if (!DOM.performance.section) return;

            // Section Title & Top Metrics
            const tl = gsap.timeline({ scrollTrigger: { trigger: DOM.performance.section, start: 'top 80%' } });
            
            tl.fromTo(DOM.performance.title, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: CONFIG.duration.base, ease: CONFIG.ease.smooth })
              .fromTo(DOM.performance.metrics, 
                  { y: 30, opacity: 0 }, 
                  { y: 0, opacity: 1, stagger: 0.1, duration: CONFIG.duration.base, ease: CONFIG.ease.premium }, 
                  "-=0.4"
              );

            // Dashboard & Charts
            gsap.fromTo(DOM.performance.equityChart,
                { y: 50, opacity: 0, scale: 0.98 },
                { y: 0, opacity: 1, scale: 1, duration: 1, ease: CONFIG.ease.premium, scrollTrigger: { trigger: DOM.performance.dashboard, start: 'top 75%' }}
            );

            gsap.fromTo(DOM.performance.monthlyTableRows,
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, stagger: 0.1, duration: CONFIG.duration.base, ease: CONFIG.ease.smooth, scrollTrigger: { trigger: DOM.performance.dashboard, start: 'top 60%' }}
            );

            // Proof Grid
            gsap.fromTo(DOM.performance.proofCards,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.15, duration: CONFIG.duration.base, ease: CONFIG.ease.premium, scrollTrigger: { trigger: DOM.performance.proofSection, start: 'top 80%' }}
            );
        },

        initContact() {
            if (!DOM.contact.section) return;

            gsap.fromTo(DOM.contact.title,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: CONFIG.duration.base, ease: CONFIG.ease.smooth, scrollTrigger: { trigger: DOM.contact.section, start: 'top 80%' }}
            );

            gsap.fromTo(DOM.contact.infoCards,
                { x: -30, opacity: 0 },
                { x: 0, opacity: 1, stagger: 0.1, duration: CONFIG.duration.base, ease: CONFIG.ease.premium, scrollTrigger: { trigger: DOM.contact.section, start: 'top 70%' }}
            );

            gsap.fromTo(DOM.contact.formGroups,
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, stagger: 0.1, duration: CONFIG.duration.base, ease: CONFIG.ease.premium, scrollTrigger: { trigger: DOM.contact.form, start: 'top 70%' }}
            );

            if (DOM.contact.submitBtn) {
                Utils.initMagneticEffect([DOM.contact.submitBtn], 20);
            }
        }
    };

    // ==========================================
    // 5. APPLICATION BOOTSTRAP
    // ==========================================
    const App = {
        init() {
            Utils.registerPlugins();
            
            // Re-calc ScrollTrigger on load to prevent layout thrashing metrics
            window.addEventListener('load', () => {
                ScrollTrigger.refresh();
            });

            // Initialize Modules
            Animations.initNavigation();
            Animations.initHero();
            Animations.initAbout();
            Animations.initStatistics();
            Animations.initPhilosophy();
            Animations.initPerformance();
            Animations.initContact();
        }
    };

    // Execute when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', App.init);
    } else {
        App.init();
    }

})();