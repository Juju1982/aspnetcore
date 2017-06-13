﻿// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

using Microsoft.AspNetCore.Razor.Language.Intermediate;
using Xunit;

namespace Microsoft.AspNetCore.Razor.Language.CodeGeneration
{
    public class LiteralRuntimeBasicWriterTest
    {
        [Fact]
        public void WriteCSharpExpression_UsesWriteLiteral_WritesLinePragma_WithSource()
        {
            // Arrange
            var writer = new LiteralRuntimeBasicWriter();

            var context = new CSharpRenderingContext()
            {
                Options = RazorCodeGenerationOptions.CreateDefault(),
                Writer = new CSharpCodeWriter(),
            };

            var node = new CSharpExpressionIntermediateNode()
            {
                Source = new SourceSpan("test.cshtml", 0, 0, 0, 3),
            };
            var builder = IntermediateNodeBuilder.Create(node);
            builder.Add(new IntermediateToken()
            {
                Content = "i++",
                Kind = IntermediateToken.TokenKind.CSharp,
            });

            // Act
            writer.WriteCSharpExpression(context, node);

            // Assert
            var csharp = context.Writer.Builder.ToString();
            Assert.Equal(
@"#line 1 ""test.cshtml""
WriteLiteral(i++);

#line default
#line hidden
",
                csharp,
                ignoreLineEndingDifferences: true);
        }
    }
}
