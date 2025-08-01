'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { 
  Github, 
  Star, 
  GitFork, 
  Code, 
  Package, 
  Shield, 
  FileText, 
  Clock,
  Activity,
  GitBranch,
  AlertCircle,
  CheckCircle,
  Zap,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { cn } from '@/app/lib/utils'

interface AnalysisResultsProps {
  data: {
    metadata: any
    structure: any
    dependencies: any[]
    codeQuality: any
    llmInsights: any
  }
}

export function AnalysisResults({ data }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const { metadata, structure, dependencies, codeQuality, llmInsights } = data

  const renderMarkdown = (content: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <div className="relative">
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
                  <code className={`language-${match[1]}`} {...props}>
                    {String(children).replace(/\n$/, '')}
                  </code>
                </pre>
              </div>
            ) : (
              <code className={cn("bg-muted px-1 py-0.5 rounded text-sm", className)} {...props}>
                {children}
              </code>
            )
          },
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-foreground">{children}</h3>,
          p: ({ children }) => <p className="mb-3 text-muted-foreground">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-muted-foreground">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-muted-foreground">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 mb-3 text-muted-foreground italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  const StatCard = ({ icon: Icon, label, value, color = "primary" }: any) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={cn(
            "p-3 rounded-full bg-opacity-10",
            color === 'primary' && "bg-primary text-primary"
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const LanguageBar = ({ languages }: { languages: Record<string, number> }) => {
    const total = Object.values(languages).reduce((sum, count) => sum + count, 0)
    const colors = [
      '#3178c6', '#f7df1e', '#4f46e5', '#dc2626', '#16a34a',
      '#9333ea', '#ea580c', '#0891b2', '#be185d', '#7c3aed'
    ]

    return (
      <div className="space-y-2">
        <div className="flex h-2 w-full rounded-full overflow-hidden">
          {Object.entries(languages).map(([lang, count], index) => (
            <div
              key={lang}
              className="h-full transition-all duration-300"
              style={{
                width: `${(count / total) * 100}%`,
                backgroundColor: colors[index % colors.length]
              }}
              title={`${lang}: ${count} files`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(languages).map(([lang, count]) => (
            <div key={lang} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: colors[Object.keys(languages).indexOf(lang) % colors.length]
                }}
              />
              <span className="text-sm text-muted-foreground">{lang} ({count})</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Repository Header */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Github className="w-6 h-6" />
                {metadata.name}
              </CardTitle>
              <CardDescription className="text-lg">
                {metadata.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="w-3 h-3" /> {metadata.stars.toLocaleString()}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Code className="w-3 h-3" /> {metadata.language}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Star}
          label="星标数"
          value={metadata.stars.toLocaleString()}
          color="yellow"
        />
        <StatCard
          icon={Code}
          label="主要语言"
          value={metadata.language}
          color="blue"
        />
        <StatCard
          icon={FileText}
          label="文件数"
          value={structure?.totalFiles || 0}
          color="green"
        />
        <StatCard
          icon={GitBranch}
          label="目录数"
          value={structure?.totalDirectories || 0}
          color="purple"
        />
      </div>

      {/* Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="w-4 h-4" /> 概览
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" /> 结构
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="flex items-center gap-2">
            <Package className="w-4 h-4" /> 依赖
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> 质量
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Zap className="w-4 h-4" /> AI洞察
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>项目概览</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Distribution */}
              <div>
                <h3 className="text-lg font-semibold mb-4">语言分布</h3>
                {structure?.languages && <LanguageBar languages={structure.languages} />}
              </div>

              {/* Topics */}
              {metadata.topics.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">主题标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {metadata.topics.map((topic: string) => (
                      <Badge key={topic} variant="secondary">{topic}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">创建于: {new Date(metadata.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">更新于: {new Date(metadata.updatedAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {metadata.license && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">许可证: {metadata.license}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">作者: {metadata.owner}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Structure Tab */}
        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>项目结构分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
                >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">文件统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">总文件数:</span>
                        <span className="font-semibold">{structure?.totalFiles || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">总目录数:</span>
                        <span className="font-semibold">{structure?.totalDirectories || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">语言种类:</span>
                        <span className="font-semibold">{Object.keys(structure?.languages || {}).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">详细语言统计</h3>
                  <div className="space-y-3">
                    {Object.entries(structure?.languages || {}).map(([lang, count]) => (
                      <div key={lang} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          <span className="font-medium">{lang}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{String(count)} 文件</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${(Number(count) / Math.max(...Object.values(structure?.languages || {}).map(Number))) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dependencies Tab */}
        <TabsContent value="dependencies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>依赖分析</CardTitle>
            </CardHeader>
            <CardContent>
              {dependencies.length === 0 ? (
                <p className="text-muted-foreground">未找到依赖项</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dependencies.map((dep) => (
                    <Card key={dep.name} className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{dep.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">版本: {dep.version}</p>
                          <Badge variant={dep.type === 'production' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {dep.type === 'production' ? '生产' : '开发'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>代码质量分析</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quality Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      可维护性
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">
                      {codeQuality?.maintainability || 0}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      平均复杂度
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-500">
                      {codeQuality?.complexity?.average || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      最大复杂度
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">
                      {codeQuality?.complexity?.max || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Complexity Details */}
              {codeQuality?.complexity?.files && codeQuality.complexity.files.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">文件复杂度详情</h3>
                  <div className="space-y-2">
                    {codeQuality.complexity.files.slice(0, 5).map((file: any) => (
                      <div key={file.path} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{file.path}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{file.lines} 行</span>
                          <span
                            className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              file.complexity > 10 
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
                                : file.complexity > 5 
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            )}
                          >
                            复杂度: {file.complexity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                AI智能分析洞察
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none"
            >
              {llmInsights && (
                <div className="space-y-6">
                  {/* Architecture */}
                  {llmInsights.architecture && (
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        架构概览
                      </h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        {renderMarkdown(llmInsights.architecture)}
                      </div>
                    </div>
                  )}

                  {/* Technology Stack */}
                  {llmInsights.technologyStack && llmInsights.technologyStack.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2"
                      >
                        <Zap className="w-5 h-5 text-yellow-500" />
                        技术栈
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {llmInsights.technologyStack.map((tech: string) => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {llmInsights.recommendations && llmInsights.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2"
                      >
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        优化建议
                      </h3>
                      <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-lg"
                      >
                        {renderMarkdown(llmInsights.recommendations.join('\n'))}
                      </div>
                    </div>
                  )}

                  {/* Potential Issues */}
                  {llmInsights.potentialIssues && llmInsights.potentialIssues.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2"
                      >
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        潜在问题
                      </h3>
                      <div className="bg-orange-50/50 dark:bg-orange-900/20 p-4 rounded-lg"
                      >
                        {renderMarkdown(llmInsights.potentialIssues.join('\n'))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}