"use client";

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useState, ChangeEvent } from 'react'
import { CheckedState } from '@radix-ui/react-checkbox'

const mockTools = [
  { id: 'notion_append_block_children', label: 'notion_append_block_children', desc: 'Append child blocks to a parent block.' },
  { id: 'notion_retrieve_block', label: 'notion_retrieve_block', desc: 'Retrieve information about a specific block.' },
  { id: 'notion_retrieve_block_children', label: 'notion_retrieve_block_children', desc: 'Retrieve the children of a specific block.' },
  { id: 'notion_delete_block', label: 'notion_delete_block', desc: 'Delete a specific block.' },
  { id: 'notion_retrieve_page', label: 'notion_retrieve_page', desc: 'Retrieve information about a specific page.' },
];

export default function IntegrationDetailsMock() {
  const [desc, setDesc] = useState('');
  const [requireAuth, setRequireAuth] = useState(false);
  const [selectedTools, setSelectedTools] = useState(mockTools.map(t => t.id));

  const handleDescChange = (e: ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value);
  const handleAuthChange = (checked: CheckedState) => setRequireAuth(checked === true);

  return (
    <Card className="p-6 max-w-3xl mx-auto mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 rounded p-2"><span className="text-2xl">📝</span></div>
          <div>
            <div className="font-bold text-lg">Notion</div>
            <div className="text-xs text-gray-500">17 tools</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-700">Official MCP</Badge>
          <span className="text-green-600 font-medium flex items-center">● Healthy</span>
          <span className="text-xs text-gray-400 ml-2">Wed Apr 23, 10:03 AM</span>
          <Avatar name="Kevin Treehan" />
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-4 mb-6">
        <a href="#" className="text-blue-600 underline">Manage</a>
        <a href="#" className="text-blue-600 underline">Read Docs</a>
        <a href="#" className="text-blue-600 underline">View Logs</a>
        <Button size="sm" className="ml-auto">Update</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Description & Auth */}
        <div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Integration Description</label>
            <Textarea
              placeholder="Enter integration description..."
              value={desc}
              onChange={handleDescChange}
            />
            <div className="text-xs text-gray-500 mt-1">
              This helps LLMs know when to use these tools.
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded">
            <Checkbox checked={requireAuth} onCheckedChange={handleAuthChange} />
            <span className="font-medium">Require Per-User Authentication</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Users connect their own accounts instead of using a shared workspace token.
          </div>
        </div>

        {/* Right: Tool Selection */}
        <div>
          <div className="font-medium mb-2">Select Tools</div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {mockTools.map(tool => (
              <label key={tool.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <Checkbox
                  checked={selectedTools.includes(tool.id)}
                  onCheckedChange={() =>
                    setSelectedTools(selectedTools =>
                      selectedTools.includes(tool.id)
                        ? selectedTools.filter(id => id !== tool.id)
                        : [...selectedTools, tool.id]
                    )
                  }
                />
                <span className="font-mono text-xs">{tool.label}</span>
                <span className="text-xs text-gray-500 ml-2">{tool.desc}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
} 