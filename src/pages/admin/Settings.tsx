import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { 
  Save, 
  Globe,
  BadgeInfo,
  Layout, 
  Menu, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2,
  Monitor
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { adminJson } from '../../lib/api';
import type { ContentCollection, HomepageSection, LinkOption, NavigationItem, SiteSetting } from '../../types/admin';
import { useSearchParams } from 'react-router-dom';
import { AdminActionToast } from '../../components/AdminActionToast';
import { ImageUpload } from '../../components/ImageUpload';

interface OrderedItem {
  id?: number;
  display_order: number;
  is_enabled: boolean;
}

const parseFooterQuickLinks = (value?: string) => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

export function AdminSettings() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'branding');
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [linkOptions, setLinkOptions] = useState<LinkOption[]>([]);
  const [collections, setCollections] = useState<ContentCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const sectionType = searchParams.get('section');
    if (activeTab !== 'sections' || !sectionType) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      document.getElementById(`section-${sectionType}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, searchParams, sections]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsData, sectionsData, navData, linkOptionsData, collectionsData] = await Promise.all([
        adminJson<SiteSetting[]>('/api/admin/settings', {}, 'Failed to load settings'),
        adminJson<HomepageSection[]>('/api/admin/homepage-sections', {}, 'Failed to load homepage sections'),
        adminJson<NavigationItem[]>('/api/admin/navigation', {}, 'Failed to load navigation items'),
        adminJson<LinkOption[]>('/api/admin/link-options', {}, 'Failed to load link options'),
        adminJson<ContentCollection[]>('/api/admin/collections', {}, 'Failed to load collections')
      ]);

      setSettings(settingsData);
      setSections(sectionsData);
      setNavItems(navData);
      setLinkOptions(linkOptionsData);
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await adminJson<{ success: boolean }>('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      }, 'Failed to save settings');
      await adminJson<{ success: boolean }>('/api/admin/homepage-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sections)
      }, 'Failed to save hero settings');
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleSaveSections = async () => {
    setSaving(true);
    try {
      await adminJson<{ success: boolean }>('/api/admin/homepage-sections', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sections)
      }, 'Failed to update homepage sections');
      setMessage({ type: 'success', text: 'Homepage sections updated' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update sections' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleSaveNavigation = async () => {
    setSaving(true);
    try {
      await adminJson<{ success: boolean }>('/api/admin/navigation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(navItems)
      }, 'Failed to update navigation');
      setMessage({ type: 'success', text: 'Navigation updated' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update navigation' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => {
      const existing = prev.find((setting) => setting.key === key);
      if (existing) {
        return prev.map((setting) => setting.key === key ? { ...setting, value } : setting);
      }

      return [...prev, { key, value, category: 'homepage' }];
    });
  };

  const getSettingValue = (key: string, fallback: string) => {
    const setting = settings.find((item) => item.key === key);
    return setting ? setting.value : fallback;
  };

  const moveItem = <T extends OrderedItem>(
    list: T[],
    setList: Dispatch<SetStateAction<T[]>>,
    index: number,
    direction: 'up' | 'down'
  ) => {
    const newList = [...list];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    
    // Update display_order
    const updatedList = newList.map((item, i) => ({ ...item, display_order: i + 1 }));
    setList(updatedList);
  };

  const toggleStatus = <T extends OrderedItem>(
    list: T[],
    setList: Dispatch<SetStateAction<T[]>>,
    index: number
  ) => {
    const newList = [...list];
    newList[index].is_enabled = !newList[index].is_enabled;
    setList(newList);
  };

  const addNavItem = () => {
    const availableItem = linkOptions.find((item) => !navItems.some((navItem) => navItem.url === item.url));
    const newItem = {
      label: availableItem?.label || 'New Link',
      url: availableItem?.url || '/',
      is_enabled: true,
      display_order: navItems.length + 1
    };
    setNavItems([...navItems, newItem]);
  };

  const sectionTemplates: Array<Pick<HomepageSection, 'title' | 'type'>> = [
    { title: 'Hero', type: 'hero' },
    { title: 'Snapshot', type: 'stats' },
    { title: 'Our Core Services', type: 'services' },
    { title: 'Featured Portfolio', type: 'portfolios' },
    { title: 'Our Subsidiaries', type: 'subsidiaries' },
    { title: 'Our Clients', type: 'clients' },
    ...collections
      .filter((item) => item.is_enabled)
      .map((item) => ({
        title: item.section_title || item.name,
        type: `collection:${item.slug}`,
      })),
  ];

  const heroDefaults = {
    title: 'Building the Future of Global Enterprise',
    description:
      'Kansan Group is a diversified holding company driving innovation and sustainable growth across technology, real estate, and logistics sectors.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    primaryLabel: 'Explore Services',
    primaryLink: '/services',
    secondaryLabel: 'Contact Us',
    secondaryLink: '/contact',
  };

  const brandingDefaults = {
    siteTitle: 'Kansan Group',
    logo: '/logo.png',
    favicon: '/favicon.ico',
    copyright: '© 2026 Kansan Group. All rights reserved.',
    description: 'Building the future of infrastructure and technology.',
    keywords: 'Kansan, Infrastructure, Technology, Group',
    footerDescription: 'Empowering businesses through innovative solutions and strategic investments across multiple sectors.',
    footerQuickLinks: ['/about', '/services', '/portfolio', '/contact'],
    footerQuickLinksTitle: 'Quick Links',
    footerSubsidiariesTitle: 'Subsidiaries',
    footerContactTitle: 'Contact Us',
    footerAddress: '123 Corporate Blvd, Suite 500\nBusiness District, NY 10001',
    footerPhone: '+1 (555) 123-4567',
    footerEmail: 'info@kansangroup.com',
    footerAdminLabel: 'Admin Portal',
  };

  const footerQuickLinkUrls = (() => {
    const quickLinksSetting = settings.find((item) => item.key === 'footer_quick_links');
    if (!quickLinksSetting) {
      return brandingDefaults.footerQuickLinks;
    }

    return parseFooterQuickLinks(quickLinksSetting.value);
  })();

  const footerLinkChoices = linkOptions.length > 0
    ? linkOptions
    : navItems.filter((item) => item.is_enabled).map((item) => ({ label: item.label, url: item.url }));

  const addFooterQuickLink = () => {
    const availableItem = footerLinkChoices.find((item) => !footerQuickLinkUrls.includes(item.url));

    if (!availableItem) {
      return;
    }

    updateSetting('footer_quick_links', JSON.stringify([...footerQuickLinkUrls, availableItem.url]));
  };

  const updateFooterQuickLink = (index: number, url: string) => {
    const nextItems = [...footerQuickLinkUrls];
    nextItems[index] = url;
    updateSetting('footer_quick_links', JSON.stringify(nextItems));
  };

  const moveFooterQuickLink = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= footerQuickLinkUrls.length) {
      return;
    }

    const nextItems = [...footerQuickLinkUrls];
    [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];
    updateSetting('footer_quick_links', JSON.stringify(nextItems));
  };

  const removeFooterQuickLink = (index: number) => {
    const nextItems = footerQuickLinkUrls.filter((_, itemIndex) => itemIndex !== index);
    updateSetting('footer_quick_links', JSON.stringify(nextItems));
  };

  const addSection = () => {
    const usedTypes = new Set(sections.map((section) => section.type));
    const template = sectionTemplates.find((item) => !usedTypes.has(item.type)) || {
      title: `Section ${sections.length + 1}`,
      type: `custom-${sections.length + 1}`,
    };

    setSections([
      ...sections,
      {
        ...template,
        is_enabled: true,
        display_order: sections.length + 1,
      },
    ]);
  };

  const removeSection = (index: number) => {
    const newList = sections.filter((_, itemIndex) => itemIndex !== index);
    setSections(newList.map((item, itemIndex) => ({ ...item, display_order: itemIndex + 1 })));
  };

  const updateSection = (index: number, field: keyof HomepageSection, value: string | boolean) => {
    const newList = [...sections];
    newList[index] = { ...newList[index], [field]: value };
    setSections(newList);
  };

  const removeNavItem = (index: number) => {
    const newList = navItems.filter((_, i) => i !== index);
    setNavItems(newList.map((item, i) => ({ ...item, display_order: i + 1 })));
  };

  const updateNavItem = (index: number, field: string, value: string) => {
    const newList = [...navItems];
    const nextItem = { ...newList[index], [field]: value };

    if (field === 'url') {
      const matchedLink = linkOptions.find((item) => item.url === value);
      if (matchedLink && (!newList[index].label || newList[index].label === 'New Link')) {
        nextItem.label = matchedLink.label;
      }
    }

    newList[index] = nextItem;
    setNavItems(newList);
  };

  if (loading) return <div className="text-center py-12">Loading settings...</div>;

  const tabs = [
    { id: 'branding', name: 'Site Branding', icon: BadgeInfo },
    { id: 'seo', name: 'SEO Metadata', icon: Globe },
    { id: 'footer', name: 'Footer Content', icon: Menu },
    { id: 'hero', name: 'Homepage Hero', icon: Monitor },
    { id: 'stats', name: 'Homepage Stats', icon: Layout },
    { id: 'sections', name: 'Homepage Sections', icon: Layout },
    { id: 'navigation', name: 'Navigation Menu', icon: Menu },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <AdminActionToast type={message.type as 'success' | 'error' | ''} text={message.text} />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="border-b border-gray-100 bg-gray-50/70 p-4 lg:border-b-0 lg:border-r">
            <div className="mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">Settings Menu</h2>
            </div>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all",
                    "lg:w-full",
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                  )}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="p-8">
          {activeTab === 'branding' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
                    <input 
                      type="text" 
                      value={getSettingValue('site_title', brandingDefaults.siteTitle)}
                      onChange={(e) => updateSetting('site_title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                    <input 
                      type="text" 
                      value={getSettingValue('site_logo', brandingDefaults.logo)}
                      onChange={(e) => updateSetting('site_logo', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <ImageUpload
                      value={getSettingValue('site_logo', brandingDefaults.logo)}
                      onChange={(url) => updateSetting('site_logo', url)}
                      label="Logo Image"
                      uploadName={getSettingValue('site_title', 'site-logo') || 'site-logo'}
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                    <input 
                      type="text" 
                      value={getSettingValue('site_favicon', brandingDefaults.favicon)}
                      onChange={(e) => updateSetting('site_favicon', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <ImageUpload
                      value={getSettingValue('site_favicon', brandingDefaults.favicon)}
                      onChange={(url) => updateSetting('site_favicon', url)}
                      label="Favicon Image"
                      uploadName={getSettingValue('site_title', 'site-favicon') || 'site-favicon'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Footer Copyright</label>
                    <input 
                      type="text" 
                      value={getSettingValue('footer_copyright', brandingDefaults.copyright)}
                      onChange={(e) => updateSetting('footer_copyright', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Settings' }
                </button>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea 
                      rows={3}
                      value={getSettingValue('site_description', brandingDefaults.description)}
                      onChange={(e) => updateSetting('site_description', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                    <textarea 
                      rows={2}
                      value={getSettingValue('site_keywords', brandingDefaults.keywords)}
                      onChange={(e) => updateSetting('site_keywords', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="comma separated values"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Settings' }
                </button>
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Footer Description</label>
                    <textarea
                      rows={3}
                      value={getSettingValue('footer_description', brandingDefaults.footerDescription)}
                      onChange={(e) => updateSetting('footer_description', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quick Links Title</label>
                    <input
                      type="text"
                      value={getSettingValue('footer_quick_links_title', brandingDefaults.footerQuickLinksTitle)}
                      onChange={(e) => updateSetting('footer_quick_links_title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Footer Quick Links</h4>
                        <p className="text-xs text-gray-500">Navigation aur custom pages me se links select aur reorder karo.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addFooterQuickLink}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        disabled={footerLinkChoices.filter((item) => !footerQuickLinkUrls.includes(item.url)).length === 0}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Link
                      </button>
                    </div>

                    <div className="space-y-2">
                      {footerQuickLinkUrls.map((url, index) => (
                        <div key={`${url}-${index}`} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2">
                          <div className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => moveFooterQuickLink(index, 'up')}
                              disabled={index === 0}
                              className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveFooterQuickLink(index, 'down')}
                              disabled={index === footerQuickLinkUrls.length - 1}
                              className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <select
                            value={url}
                            onChange={(e) => updateFooterQuickLink(index, e.target.value)}
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            {footerLinkChoices.map((item) => (
                              <option key={item.url} value={item.url}>
                                {item.label} ({item.url})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeFooterQuickLink(index)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subsidiaries Title</label>
                    <input
                      type="text"
                      value={getSettingValue('footer_subsidiaries_title', brandingDefaults.footerSubsidiariesTitle)}
                      onChange={(e) => updateSetting('footer_subsidiaries_title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Title</label>
                    <input
                      type="text"
                      value={getSettingValue('footer_contact_title', brandingDefaults.footerContactTitle)}
                      onChange={(e) => updateSetting('footer_contact_title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Footer Contact</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      rows={3}
                      value={getSettingValue('footer_address', brandingDefaults.footerAddress)}
                      onChange={(e) => updateSetting('footer_address', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={getSettingValue('footer_phone', brandingDefaults.footerPhone)}
                      onChange={(e) => updateSetting('footer_phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="text"
                      value={getSettingValue('footer_email', brandingDefaults.footerEmail)}
                      onChange={(e) => updateSetting('footer_email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Link Label</label>
                    <input
                      type="text"
                      value={getSettingValue('footer_admin_label', brandingDefaults.footerAdminLabel)}
                      onChange={(e) => updateSetting('footer_admin_label', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Settings' }
                </button>
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_360px] gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Eyebrow / Section Name</label>
                    <input
                      type="text"
                      value={sections.find((section) => section.type === 'hero')?.title || 'Hero'}
                      onChange={(e) => {
                        const heroIndex = sections.findIndex((section) => section.type === 'hero');
                        if (heroIndex >= 0) {
                          updateSection(heroIndex, 'title', e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                    <textarea
                      rows={3}
                      value={getSettingValue('hero_title', heroDefaults.title)}
                      onChange={(e) => updateSetting('hero_title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Description</label>
                    <textarea
                      rows={4}
                      value={getSettingValue('hero_description', heroDefaults.description)}
                      onChange={(e) => updateSetting('hero_description', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Label</label>
                      <input
                        type="text"
                        value={getSettingValue('hero_primary_label', heroDefaults.primaryLabel)}
                        onChange={(e) => updateSetting('hero_primary_label', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Link</label>
                      <input
                        type="text"
                        value={getSettingValue('hero_primary_link', heroDefaults.primaryLink)}
                        onChange={(e) => updateSetting('hero_primary_link', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="/services"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Label</label>
                      <input
                        type="text"
                        value={getSettingValue('hero_secondary_label', heroDefaults.secondaryLabel)}
                        onChange={(e) => updateSetting('hero_secondary_label', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Link</label>
                      <input
                        type="text"
                        value={getSettingValue('hero_secondary_link', heroDefaults.secondaryLink)}
                        onChange={(e) => updateSetting('hero_secondary_link', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <ImageUpload
                      value={getSettingValue('hero_image', heroDefaults.image)}
                      onChange={(url) => updateSetting('hero_image', url)}
                      label="Hero Background Image"
                      uploadName={getSettingValue('hero_title', 'hero-background-image') || 'hero-background-image'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
                    <input
                      type="text"
                      value={getSettingValue('hero_image', heroDefaults.image)}
                      onChange={(e) => updateSetting('hero_image', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Settings' }
                </button>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subsidiaries Label</label>
                    <input 
                      type="text" 
                      value={getSettingValue('stats_subsidiaries_label', 'Subsidiaries')}
                      onChange={(e) => updateSetting('stats_subsidiaries_label', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clients Label</label>
                    <input 
                      type="text" 
                      value={getSettingValue('stats_clients_label', 'Clients')}
                      onChange={(e) => updateSetting('stats_clients_label', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employees Label</label>
                    <input 
                      type="text" 
                      value={getSettingValue('stats_employees_label', 'Employees')}
                      onChange={(e) => updateSetting('stats_employees_label', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Label</label>
                    <input 
                      type="text" 
                      value={getSettingValue('stats_experience_label', 'Years Experience')}
                      onChange={(e) => updateSetting('stats_experience_label', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    Subsidiaries and Clients counts homepage par automatically real data se aayenge.
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employees Value</label>
                    <input 
                      type="text" 
                      value={getSettingValue('stats_employees_value', '0')}
                      onChange={(e) => updateSetting('stats_employees_value', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Value</label>
                    <input 
                      type="text" 
                      value={getSettingValue('stats_experience_value', '0')}
                      onChange={(e) => updateSetting('stats_experience_value', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}

          {/* Homepage Sections Tab */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 text-blue-800 text-sm mb-6 flex-1">
                  <Monitor className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>Use the arrows to reorder sections. Each section type is kept only once, so duplicate entries will not be saved anymore.</p>
                </div>
                <button
                  onClick={addSection}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Section
                </button>
              </div>

              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div 
                    key={section.id}
                    id={`section-${section.type}`}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      section.is_enabled ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100 opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-gray-100 text-gray-500 p-2 rounded-lg font-mono text-xs w-8 text-center">
                          {index + 1}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(index, 'title', e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <select
                            value={section.type}
                            onChange={(e) => updateSection(index, 'type', e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            {sectionTemplates.map((item) => (
                              <option key={item.type} value={item.type}>
                                {item.type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveItem(sections, setSections, index, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-20"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveItem(sections, setSections, index, 'down')}
                          disabled={index === sections.length - 1}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-20"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(sections, setSections, index)}
                          className={cn(
                            "ml-2 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors",
                            section.is_enabled 
                              ? "bg-green-100 text-green-700 hover:bg-green-200" 
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          )}
                        >
                          {section.is_enabled ? (
                            <><Eye className="h-3.5 w-3.5" /> Enabled</>
                          ) : (
                            <><EyeOff className="h-3.5 w-3.5" /> Disabled</>
                          )}
                        </button>
                        <button
                          onClick={() => removeSection(index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove section"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t flex justify-end">
                <button
                  onClick={handleSaveSections}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Updating...' : 'Apply Layout'}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tab */}
          {activeTab === 'navigation' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Manage Menu Links</h3>
                  <p className="text-sm text-gray-500">Published pages aur existing links yahan auto options me available rahenge.</p>
                </div>
                <button
                  onClick={addNavItem}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Item
                </button>
              </div>

              <div className="space-y-4">
                {navItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 group">
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => moveItem(navItems, setNavItems, index, 'up')}
                        disabled={index === 0}
                        className="text-gray-300 hover:text-blue-600 disabled:opacity-0"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => moveItem(navItems, setNavItems, index, 'down')}
                        disabled={index === navItems.length - 1}
                        className="text-gray-300 hover:text-blue-600 disabled:opacity-0"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <input 
                          type="text"
                          placeholder="Label (e.g. About)"
                          value={item.label}
                          onChange={(e) => updateNavItem(index, 'label', e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <input 
                          type="text"
                          placeholder="URL (e.g. /about)"
                          value={item.url}
                          onChange={(e) => updateNavItem(index, 'url', e.target.value)}
                          list={`nav-link-options-${index}`}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <datalist id={`nav-link-options-${index}`}>
                          {linkOptions.map((option) => (
                            <option key={option.url} value={option.url}>
                              {option.label}
                            </option>
                          ))}
                        </datalist>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <button
                        onClick={() => toggleStatus(navItems, setNavItems, index)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          item.is_enabled ? "text-blue-600 hover:bg-blue-100" : "text-gray-400 hover:bg-gray-200"
                        )}
                        title={item.is_enabled ? "Disable link" : "Enable link"}
                      >
                        {item.is_enabled ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => removeNavItem(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t flex justify-end">
                <button
                  onClick={handleSaveNavigation}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Navigation'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
