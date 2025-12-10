import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/components/theme/ThemeContext';
import ThemedBackground from '@/components/theme/ThemedBackground';
import GlassCard from '@/components/theme/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  LogOut, 
  Brain, 
  Heart, 
  Zap, 
  Target, 
  Home as HomeIcon,
  ChevronDown,
  ChevronRight,
  Save
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { isDarkMode, theme } = useTheme();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    section1: true,
    section2: false,
    section3: false,
    section4: false
  });

  const [profileData, setProfileData] = useState({
    section1_identity: {},
    section1_coaching: {},
    section1_goals: {},
    section1_rhythm: {},
    section1_constraints: {},
    section2_cognitive: {},
    section2_motivational: {},
    section2_emotional: {},
    section2_habit: {},
    section3_psychological: {},
    section3_identity: {},
    section3_archetype: '',
    section3_resistance: {},
    section3_energy: {},
    section4_environment: {}
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin('/Profile');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin('/Profile');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (profile) {
      setProfileData(prev => ({ ...prev, ...profile }));
    }
  }, [profile]);

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        return await base44.entities.UserProfile.update(profile.id, data);
      } else {
        return await base44.entities.UserProfile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
    }
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleSave = () => {
    saveProfileMutation.mutate(profileData);
  };

  const updateField = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
        <div 
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <ThemedBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto p-6 space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(createPageUrl('Home'))}
            className={isDarkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-zinc-600 hover:text-zinc-900'}
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className={isDarkMode ? 'border-red-500/50 text-red-400 hover:bg-red-500/20' : 'border-red-300 text-red-600 hover:bg-red-50'}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <GlassCard className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
              style={{ backgroundColor: theme.accent }}
            >
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{user?.full_name || 'User'}</h1>
              <p className="text-white/60">{user?.email}</p>
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={saveProfileMutation.isPending}
            style={{ backgroundColor: theme.accent }}
            className="text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {/* Section 1: Essential */}
        <GlassCard className="p-6">
          <button
            onClick={() => toggleSection('section1')}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-3">
              <User className="w-6 h-6" style={{ color: theme.accent }} />
              <h2 className="text-2xl font-bold text-white">Essential Profile</h2>
            </div>
            {expandedSections.section1 ? <ChevronDown className="w-5 h-5 text-white/60" /> : <ChevronRight className="w-5 h-5 text-white/60" />}
          </button>

          {expandedSections.section1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">First Name</Label>
                  <Input
                    value={profileData.section1_identity?.first_name || ''}
                    onChange={(e) => updateField('section1_identity', 'first_name', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Preferred Name</Label>
                  <Input
                    value={profileData.section1_identity?.preferred_name || ''}
                    onChange={(e) => updateField('section1_identity', 'preferred_name', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Pronouns</Label>
                  <Input
                    value={profileData.section1_identity?.pronouns || ''}
                    onChange={(e) => updateField('section1_identity', 'pronouns', e.target.value)}
                    placeholder="e.g., she/her, they/them"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Time Zone</Label>
                  <Input
                    value={profileData.section1_identity?.time_zone || ''}
                    onChange={(e) => updateField('section1_identity', 'time_zone', e.target.value)}
                    placeholder="e.g., America/New_York"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Coaching Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Coaching Tone</Label>
                    <Select 
                      value={profileData.section1_coaching?.coaching_tone || ''}
                      onValueChange={(value) => updateField('section1_coaching', 'coaching_tone', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gentle">Gentle</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="direct">Direct</SelectItem>
                        <SelectItem value="tough_love">Tough Love</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Coaching Style</Label>
                    <Select 
                      value={profileData.section1_coaching?.coaching_style || ''}
                      onValueChange={(value) => updateField('section1_coaching', 'coaching_style', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="motivational">Motivational</SelectItem>
                        <SelectItem value="strategic">Strategic</SelectItem>
                        <SelectItem value="accountability">Accountability</SelectItem>
                        <SelectItem value="reflective">Reflective</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Session Preference</Label>
                    <Select 
                      value={profileData.section1_coaching?.session_preference || ''}
                      onValueChange={(value) => updateField('section1_coaching', 'session_preference', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voice_first">Voice-first</SelectItem>
                        <SelectItem value="text_first">Text-first</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Length Preference</Label>
                    <Select 
                      value={profileData.section1_coaching?.length_preference || ''}
                      onValueChange={(value) => updateField('section1_coaching', 'length_preference', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short_bursts">Short bursts</SelectItem>
                        <SelectItem value="standard">Standard sessions</SelectItem>
                        <SelectItem value="deep_dives">Deep dives</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Daily Rhythm</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Morning Check-in</Label>
                    <Input
                      type="time"
                      value={profileData.section1_rhythm?.morning_checkin || ''}
                      onChange={(e) => updateField('section1_rhythm', 'morning_checkin', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Evening Reflection</Label>
                    <Input
                      type="time"
                      value={profileData.section1_rhythm?.evening_reflection || ''}
                      onChange={(e) => updateField('section1_rhythm', 'evening_reflection', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Nudge Sensitivity</Label>
                    <Select 
                      value={profileData.section1_rhythm?.nudge_sensitivity || ''}
                      onValueChange={(value) => updateField('section1_rhythm', 'nudge_sensitivity', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select sensitivity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Section 2: Advanced Profile */}
        <GlassCard className="p-6">
          <button
            onClick={() => toggleSection('section2')}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6" style={{ color: theme.accent }} />
              <h2 className="text-2xl font-bold text-white">Advanced Profile</h2>
            </div>
            {expandedSections.section2 ? <ChevronDown className="w-5 h-5 text-white/60" /> : <ChevronRight className="w-5 h-5 text-white/60" />}
          </button>

          {expandedSections.section2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Cognitive Profile</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-white">Analytical ←→ Intuitive (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={profileData.section2_cognitive?.analytical_intuitive || ''}
                      onChange={(e) => updateField('section2_cognitive', 'analytical_intuitive', parseInt(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Big Picture ←→ Detail-Oriented (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={profileData.section2_cognitive?.bigpicture_detail || ''}
                      onChange={(e) => updateField('section2_cognitive', 'bigpicture_detail', parseInt(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Decision-making Speed (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={profileData.section2_cognitive?.decision_speed || ''}
                      onChange={(e) => updateField('section2_cognitive', 'decision_speed', parseInt(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Motivational Architecture</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-white">Personal "Why"</Label>
                    <Textarea
                      value={profileData.section2_motivational?.personal_why || ''}
                      onChange={(e) => updateField('section2_motivational', 'personal_why', e.target.value)}
                      placeholder="Why does this goal matter to you?"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Streak Sensitivity (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={profileData.section2_motivational?.streak_sensitivity || ''}
                      onChange={(e) => updateField('section2_motivational', 'streak_sensitivity', parseInt(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Emotional Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Stress Baseline (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={profileData.section2_emotional?.stress_baseline || ''}
                      onChange={(e) => updateField('section2_emotional', 'stress_baseline', parseInt(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Anxiety Baseline (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={profileData.section2_emotional?.anxiety_baseline || ''}
                      onChange={(e) => updateField('section2_emotional', 'anxiety_baseline', parseInt(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Emotional Volatility (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={profileData.section2_emotional?.emotional_volatility || ''}
                      onChange={(e) => updateField('section2_emotional', 'emotional_volatility', parseInt(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Section 3: Expert Profile */}
        <GlassCard className="p-6">
          <button
            onClick={() => toggleSection('section3')}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6" style={{ color: theme.accent }} />
              <h2 className="text-2xl font-bold text-white">Expert Profile</h2>
            </div>
            {expandedSections.section3 ? <ChevronDown className="w-5 h-5 text-white/60" /> : <ChevronRight className="w-5 h-5 text-white/60" />}
          </button>

          {expandedSections.section3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Identity Architecture</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-white">Current Identity Statement</Label>
                    <Textarea
                      value={profileData.section3_identity?.current_identity || ''}
                      onChange={(e) => updateField('section3_identity', 'current_identity', e.target.value)}
                      placeholder="How I see myself today..."
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Future Self Statement</Label>
                    <Textarea
                      value={profileData.section3_identity?.future_self || ''}
                      onChange={(e) => updateField('section3_identity', 'future_self', e.target.value)}
                      placeholder="Who I am becoming..."
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Behavioral Archetype</h3>
                <Select 
                  value={profileData.section3_archetype || ''}
                  onValueChange={(value) => setProfileData(prev => ({ ...prev, section3_archetype: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select archetype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initiator">Initiator (starts strong, fades quickly)</SelectItem>
                    <SelectItem value="stabilizer">Stabilizer (consistent but rarely evolves)</SelectItem>
                    <SelectItem value="explorer">Explorer (insight-driven but nonlinear)</SelectItem>
                    <SelectItem value="transformer">Transformer (high insight + high execution)</SelectItem>
                    <SelectItem value="resister">Resister (high friction, low momentum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Behavioral Energy Model</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Motivational Voltage</Label>
                    <Select 
                      value={profileData.section3_energy?.motivational_voltage || ''}
                      onValueChange={(value) => updateField('section3_energy', 'motivational_voltage', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select voltage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Resistance Profile</Label>
                    <Select 
                      value={profileData.section3_energy?.resistance_profile || ''}
                      onValueChange={(value) => updateField('section3_energy', 'resistance_profile', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select resistance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Friction</SelectItem>
                        <SelectItem value="moderate">Moderate Friction</SelectItem>
                        <SelectItem value="high">High Friction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Section 4: Environmental Profile */}
        <GlassCard className="p-6">
          <button
            onClick={() => toggleSection('section4')}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6" style={{ color: theme.accent }} />
              <h2 className="text-2xl font-bold text-white">Environmental Profile</h2>
            </div>
            {expandedSections.section4 ? <ChevronDown className="w-5 h-5 text-white/60" /> : <ChevronRight className="w-5 h-5 text-white/60" />}
          </button>

          {expandedSections.section4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Physical Environment</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-white">Quiet ←→ Chaotic (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={profileData.section4_environment?.physical?.quiet_chaotic || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        section4_environment: {
                          ...prev.section4_environment,
                          physical: {
                            ...prev.section4_environment?.physical,
                            quiet_chaotic: parseInt(e.target.value)
                          }
                        }
                      }))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Routine Stability (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={profileData.section4_environment?.physical?.routine_stability || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        section4_environment: {
                          ...prev.section4_environment,
                          physical: {
                            ...prev.section4_environment?.physical,
                            routine_stability: parseInt(e.target.value)
                          }
                        }
                      }))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Social Environment</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-white">Social Pressure Level (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={profileData.section4_environment?.social?.social_pressure || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        section4_environment: {
                          ...prev.section4_environment,
                          social: {
                            ...prev.section4_environment?.social,
                            social_pressure: parseInt(e.target.value)
                          }
                        }
                      }))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}