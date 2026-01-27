/**
 * Rule Engine for Smart Link Hub
 * Evaluates rules to filter and prioritize links based on context
 */

class RuleEngine {
  /**
   * Evaluate all rules and return filtered/prioritized links
   * @param {Array} links - Links to evaluate
   * @param {Array} rules - Rules configuration
   * @param {Object} context - Context object with time, device, location, analytics
   * @returns {Array} - Filtered and prioritized links
   */
  static evaluateRules(links, rules, context) {
    if (!rules || rules.length === 0) {
      // No rules, return all active links sorted by position
      return links.filter(l => l.is_active).sort((a, b) => a.position - b.position);
    }

    let filteredLinks = [...links];

    // Apply each rule
    rules.forEach(rule => {
      if (rule.type === "time-based") {
        filteredLinks = this.applyTimeBasedRule(filteredLinks, rule, context);
      } else if (rule.type === "device-based") {
        filteredLinks = this.applyDeviceBasedRule(filteredLinks, rule, context);
      } else if (rule.type === "location-based") {
        filteredLinks = this.applyLocationBasedRule(filteredLinks, rule, context);
      } else if (rule.type === "performance-based") {
        filteredLinks = this.applyPerformanceBasedRule(filteredLinks, rule, context);
      }
    });

    // Sort by position if not reordered by performance
    filteredLinks = filteredLinks.sort((a, b) => a.position - b.position);

    return filteredLinks.filter(l => l.is_active);
  }

  /**
   * Apply time-based rules (working hours, specific times, etc.)
   */
  static applyTimeBasedRule(links, rule, context) {
    if (!context.time) context.time = new Date();
    
    const hour = context.time.getHours();
    const dayOfWeek = context.time.getDay();

    if (rule.config.type === "working-hours") {
      const isWorkingHours = hour >= 9 && hour < 17 && dayOfWeek >= 1 && dayOfWeek <= 5;
      
      if (isWorkingHours && rule.config.workingHoursLinks) {
        return links.map(l => 
          rule.config.workingHoursLinks.includes(l.id) ? l : null
        ).filter(Boolean);
      } else if (!isWorkingHours && rule.config.nonWorkingHoursLinks) {
        return links.map(l => 
          rule.config.nonWorkingHoursLinks.includes(l.id) ? l : null
        ).filter(Boolean);
      }
    }

    if (rule.config.type === "specific-times") {
      const { startHour, endHour, linkIds } = rule.config;
      if (hour >= startHour && hour < endHour) {
        return links.filter(l => linkIds.includes(l.id));
      }
    }

    return links;
  }

  /**
   * Apply device-based rules (mobile vs desktop)
   */
  static applyDeviceBasedRule(links, rule, context) {
    if (!context.userAgent) return links;

    const isMobile = /mobile|android|iphone|ipad/i.test(context.userAgent);

    if (rule.config.type === "device-specific") {
      const { mobileLinks, desktopLinks } = rule.config;
      
      if (isMobile && mobileLinks) {
        return links.filter(l => mobileLinks.includes(l.id));
      } else if (!isMobile && desktopLinks) {
        return links.filter(l => desktopLinks.includes(l.id));
      }
    }

    return links;
  }

  /**
   * Apply location-based rules (country, region)
   */
  static applyLocationBasedRule(links, rule, context) {
    if (!context.country) return links;

    if (rule.config.type === "country-specific") {
      const { countries, linkIds } = rule.config;
      
      if (countries.includes(context.country)) {
        return links.filter(l => linkIds.includes(l.id));
      }
    }

    if (rule.config.type === "region-specific") {
      const { regions, linkIds } = rule.config;
      
      if (regions.includes(context.region)) {
        return links.filter(l => linkIds.includes(l.id));
      }
    }

    return links;
  }

  /**
   * Apply performance-based rules (auto-promote top clicks)
   */
  static applyPerformanceBasedRule(links, rule, context) {
    if (rule.config.type === "top-performers") {
      const { topN, minClicks } = rule.config;
      
      // Sort by clicks descending
      const sorted = [...links].sort((a, b) => b.clicks - a.clicks);
      
      // Get top N links with minimum clicks
      const topLinks = sorted
        .filter(l => l.clicks >= (minClicks || 0))
        .slice(0, topN || 3);

      // If we have top performers, show them first
      if (topLinks.length > 0) {
        topLinks.forEach((link, index) => {
          link.position = index; // Reorder to top
        });
        
        // Add remaining links
        const remaining = links.filter(l => !topLinks.some(t => t.id === l.id));
        remaining.forEach((link, index) => {
          link.position = topLinks.length + index;
        });

        return topLinks.concat(remaining);
      }
    }

    return links;
  }

  /**
   * Create a rule configuration template
   */
  static createRule(type, config) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      config,
      enabled: true,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Validate rule configuration
   */
  static validateRule(rule) {
    if (!rule.type) return { valid: false, error: "Rule type is required" };
    
    const validTypes = ["time-based", "device-based", "location-based", "performance-based"];
    if (!validTypes.includes(rule.type)) {
      return { valid: false, error: "Invalid rule type" };
    }

    if (!rule.config) return { valid: false, error: "Rule config is required" };

    return { valid: true };
  }
}

module.exports = RuleEngine;
