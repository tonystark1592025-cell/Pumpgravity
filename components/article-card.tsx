'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, User } from "lucide-react"
import { ImageWithFallback } from "@/components/image-with-fallback"
import Link from "next/link"

interface ArticleCardProps {
  article: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    category: string;
    tags: string[];
    content: string;
    publishedAt?: string;
    createdAt: string;
    author?: {
      username: string;
    };
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow flex flex-col overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        <ImageWithFallback
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{article.category}</Badge>
        </div>
        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/articles/${article.slug}`}>
            {article.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {article.excerpt}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {article.author?.username || 'Admin'}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {Math.ceil(article.content.length / 1000)} min
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
          </div>
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {article.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{article.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}