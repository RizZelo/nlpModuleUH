/**
 * StructuredCVDisplay Component
 * Displays the structured CV data in a readable format
 */
import React from 'react';
import { User, Briefcase, GraduationCap, Code, Award, FileText, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';

export default function StructuredCVDisplay({ structuredCV }) {
  if (!structuredCV) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No structured CV data available</p>
      </div>
    );
  }

  const { summary, contact, experience, education, skills, projects, certifications, activities, volunteer, other_sections } = structuredCV;

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      {contact && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {contact.name && contact.name !== "Not provided" && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span>{contact.name}</span>
              </div>
            )}
            {contact.email && contact.email !== "Not provided" && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{contact.email}</span>
              </div>
            )}
            {contact.phone && contact.phone !== "Not provided" && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.location && contact.location !== "Not provided" && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{contact.location}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && summary !== "Not provided" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Professional Summary</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {Array.isArray(experience) && experience.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Work Experience</h3>
          </div>
          <div className="space-y-6">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="border-l-2 border-blue-200 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{exp.title}</h4>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {exp.startDate} - {exp.endDate}
                  </div>
                </div>
                {exp.location && exp.location !== "Not provided" && (
                  <p className="text-xs text-gray-500 mb-2">{exp.location}</p>
                )}
                {exp.description && exp.description !== "Not provided" && (
                  <p className="text-sm text-gray-700 mb-2">{exp.description}</p>
                )}
                {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {exp.bullets.map((bullet, bidx) => (
                      <li key={bidx}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {Array.isArray(education) && education.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Education</h3>
          </div>
          <div className="space-y-4">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="border-l-2 border-green-200 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {edu.startDate} - {edu.endDate}
                  </div>
                </div>
                {edu.gpa && edu.gpa !== "Not provided" && (
                  <p className="text-xs text-gray-600 mb-1">GPA: {edu.gpa}</p>
                )}
                {edu.description && edu.description !== "Not provided" && (
                  <p className="text-sm text-gray-700">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && Object.keys(skills).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Skills</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(skills).map(([category, items]) => {
              if (!Array.isArray(items) || items.length === 0) return null;
              
              // Capitalize category name for display
              const displayName = category
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              
              // Color mapping for different skill types
              const colorMap = {
                technical: 'bg-blue-100 text-blue-800',
                languages: 'bg-green-100 text-green-800',
                tools: 'bg-purple-100 text-purple-800',
                soft_skills: 'bg-orange-100 text-orange-800',
                other: 'bg-gray-100 text-gray-800'
              };
              const colorClass = colorMap[category] || 'bg-gray-100 text-gray-800';
              
              return (
                <div key={category}>
                  <p className="text-xs font-semibold text-gray-700 mb-2">{displayName}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, idx) => (
                      <span key={idx} className={`px-3 py-1 ${colorClass} rounded-full text-xs`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Projects */}
      {Array.isArray(projects) && projects.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Projects</h3>
          </div>
          <div className="space-y-4">
            {projects.map((proj, idx) => (
              <div key={proj.id || idx} className="border-l-2 border-purple-200 pl-4">
                <h4 className="font-bold text-gray-900">{proj.name}</h4>
                {proj.description && proj.description !== "Not provided" && (
                  <p className="text-sm text-gray-700 mt-1">{proj.description}</p>
                )}
                {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {proj.technologies.map((tech, tidx) => (
                      <span key={tidx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {Array.isArray(certifications) && certifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Certifications</h3>
          </div>
          <div className="space-y-3">
            {certifications.map((cert, idx) => (
              <div key={cert.id || idx} className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{cert.name}</h4>
                  <p className="text-xs text-gray-600">{cert.issuer}</p>
                </div>
                <span className="text-xs text-gray-500">{cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activities / Associations */}
      {Array.isArray(activities) && activities.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Activities & Associations</h3>
          </div>
          <div className="space-y-4">
            {activities.map((act, idx) => (
              <div key={act.id || idx} className="border-l-2 border-indigo-200 pl-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{act.organization}</h4>
                    {act.title && <p className="text-xs text-gray-600">{act.title}</p>}
                  </div>
                  <span className="text-xs text-gray-500">{act.startDate} - {act.endDate}</span>
                </div>
                {act.description && act.description !== 'Not provided' && (
                  <p className="text-xs text-gray-700">{act.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Volunteer Work */}
      {Array.isArray(volunteer) && volunteer.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Volunteer Experience</h3>
          </div>
          <div className="space-y-4">
            {volunteer.map((vol, idx) => (
              <div key={vol.id || idx} className="border-l-2 border-teal-200 pl-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{vol.organization}</h4>
                    {vol.role && <p className="text-xs text-gray-600">{vol.role}</p>}
                  </div>
                  <span className="text-xs text-gray-500">{vol.startDate} - {vol.endDate}</span>
                </div>
                {vol.description && vol.description !== 'Not provided' && (
                  <p className="text-xs text-gray-700">{vol.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Sections (dynamically captured) */}
      {other_sections && Object.keys(other_sections).length > 0 && (
        <>
          {Object.entries(other_sections).map(([sectionName, sectionData]) => {
            if (!Array.isArray(sectionData) || sectionData.length === 0) return null;
            
            return (
              <div key={sectionName} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    {sectionName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </h3>
                </div>
                <div className="space-y-3">
                  {sectionData.map((item, idx) => (
                    <div key={item.id || idx} className="border-l-2 border-gray-200 pl-4">
                      {typeof item === 'object' ? (
                        <div className="text-sm text-gray-700">
                          {Object.entries(item).map(([key, value]) => {
                            if (key === 'id' || !value || value === 'Not provided') return null;
                            return (
                              <div key={key} className="mb-1">
                                <span className="font-semibold">{key.replace(/_/g, ' ')}: </span>
                                <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700">{item}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Empty state for missing sections */}
      {!experience?.length && !education?.length && !projects?.length && !skills && !certifications?.length && !activities?.length && !volunteer?.length && (!other_sections || Object.keys(other_sections).length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-sm text-yellow-800">No detailed sections parsed. Try re-uploading a clearer CV or using a different format.</p>
        </div>
      )}
    </div>
  );
}
