/**
 * StructuredCVDisplay Component
 * Displays the structured CV data in a readable format
 */
import React from 'react';
import { User, Briefcase, GraduationCap, Code, Award, FileText, Mail, Phone, MapPin } from 'lucide-react';

export default function StructuredCVDisplay({ structuredCV }) {
  if (!structuredCV) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No structured CV data available</p>
      </div>
    );
  }

  const { summary, contact, experience, education, skills, projects, certifications } = structuredCV;

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
      {experience && experience.length > 0 && (
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
                {exp.bullets && exp.bullets.length > 0 && (
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
      {education && education.length > 0 && (
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
            {skills.technical && skills.technical.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Technical Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skills.technical.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.languages && skills.languages.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {skills.languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.tools && skills.tools.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Tools & Technologies</p>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((tool, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
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
                {proj.technologies && proj.technologies.length > 0 && (
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
      {certifications && certifications.length > 0 && (
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
    </div>
  );
}
